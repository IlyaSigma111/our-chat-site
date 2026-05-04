const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(uploadDir));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/opencode_chat', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('✅ Connected to MongoDB');
}).catch(err => {
    console.error('❌ MongoDB connection error:', err);
});

// ==================== SCHEMAS ====================

// Message Schema
const messageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['user', 'assistant'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        default: 'anonymous'
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// File Schema
const fileSchema = new mongoose.Schema({
    originalName: String,
    filename: String,
    path: String,
    size: Number,
    mimetype: String,
    uploadedBy: {
        type: String,
        default: 'anonymous'
    },
    downloadCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// User Schema (optional, for future auth)
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Message = mongoose.model('Message', messageSchema);
const File = mongoose.model('File', fileSchema);
const User = mongoose.model('User', userSchema);

// ==================== MULTER CONFIG ====================

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
    },
    fileFilter: (req, file, cb) => {
        // Accept all files for now
        cb(null, true);
    }
});

// ==================== ROUTES ====================

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// ==================== CHAT ROUTES ====================

// Get all messages (with optional limit)
app.get('/api/messages', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const messages = await Message.find()
            .sort({ timestamp: -1 })
            .limit(limit);
        res.json(messages.reverse());
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Send a message
app.post('/api/messages', async (req, res) => {
    try {
        const { role, content, userId } = req.body;
        
        if (!role || !content) {
            return res.status(400).json({ error: 'Role and content are required' });
        }

        const message = new Message({
            role,
            content,
            userId: userId || 'anonymous'
        });

        await message.save();

        // If it's a user message, simulate AI response (replace with actual AI API call)
        if (role === 'user') {
            // TODO: Replace with actual AI API call (OpenAI, Anthropic, etc.)
            const aiResponse = new Message({
                role: 'assistant',
                content: `Получил ваше сообщение: "${content}"\n\nЭто автоответ. Подключите реальный ИИ API.`,
                userId: userId || 'anonymous'
            });
            await aiResponse.save();
            
            res.json({
                userMessage: message,
                assistantMessage: aiResponse
            });
        } else {
            res.json({ message });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Clear all messages (optional, for admin)
app.delete('/api/messages', async (req, res) => {
    try {
        await Message.deleteMany({});
        res.json({ message: 'All messages deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== FILE ROUTES ====================

// Upload file
app.post('/api/files/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const file = new File({
            originalName: req.file.originalname,
            filename: req.file.filename,
            path: `/uploads/${req.file.filename}`,
            size: req.file.size,
            mimetype: req.file.mimetype,
            uploadedBy: req.body.userId || 'anonymous'
        });

        await file.save();

        res.json({
            message: 'File uploaded successfully',
            file: {
                id: file._id,
                originalName: file.originalName,
                filename: file.filename,
                size: file.size,
                mimetype: file.mimetype,
                path: file.path,
                createdAt: file.createdAt
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all files
app.get('/api/files', async (req, res) => {
    try {
        const files = await File.find().sort({ createdAt: -1 });
        res.json(files);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Download file
app.get('/api/files/download/:id', async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        const filePath = path.join(__dirname, uploadDir, file.filename);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found on disk' });
        }

        // Increment download count
        file.downloadCount += 1;
        await file.save();

        res.download(filePath, file.originalName);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete file
app.delete('/api/files/:id', async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        // Delete from disk
        const filePath = path.join(__dirname, uploadDir, file.filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Delete from DB
        await file.deleteOne();
        
        res.json({ message: 'File deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📁 File uploads directory: ${path.resolve(uploadDir)}`);
    console.log(`🔗 API available at http://localhost:${PORT}/api`);
});

module.exports = app;
