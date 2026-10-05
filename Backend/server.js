require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const STATUSES = ['Applied', 'Interview', 'Offer', 'Rejected'];
const JWT_SECRET = process.env.JWT_SECRET;

const User = mongoose.model(
  'User',
  new mongoose.Schema(
    {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, unique: true, lowercase: true, trim: true },
      password: { type: String, required: true }, // bcrypt hash, never the plain password
    },
    { timestamps: true }
  )
);

const Application = mongoose.model(
  'Application',
  new mongoose.Schema(
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      company: { type: String, required: true, trim: true },
      role: { type: String, required: true, trim: true },
      status: { type: String, enum: STATUSES, default: 'Applied' },
      appliedOn: { type: Date, default: Date.now },
      notes: { type: String, default: '' },
    },
    { timestamps: true }
  )
);

const route = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Reads "Authorization: Bearer <token>", verifies it, attaches req.userId
const requireAuth = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Not signed in.' });
  try {
    req.userId = jwt.verify(token, JWT_SECRET).sub;
    next();
  } catch {
    res.status(401).json({ error: 'Session expired. Please sign in again.' });
  }
};

const signToken = (user) => jwt.sign({ sub: user._id.toString() }, JWT_SECRET, { expiresIn: '30d' });
const publicUser = (user) => ({ id: user._id, name: user.name, email: user.email });

app.get('/', (req, res) => res.send('Job tracker API is running'));

// --- Auth ---
app.post('/api/auth/register', route(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required.' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  if (await User.findOne({ email: email.toLowerCase() })) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }
  const user = await User.create({ name, email, password: await bcrypt.hash(password, 10) });
  res.status(201).json({ token: signToken(user), user: publicUser(user) });
}));

app.post('/api/auth/login', route(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: (email || '').toLowerCase() });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Incorrect email or password.' });
  }
  res.json({ token: signToken(user), user: publicUser(user) });
}));

app.get('/api/auth/me', requireAuth, route(async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json({ user: publicUser(user) });
}));

// --- Applications (every route scoped to the signed-in user) ---
app.get('/api/applications', requireAuth, route(async (req, res) => {
  const filter = { user: req.userId };
  if (STATUSES.includes(req.query.status)) filter.status = req.query.status;
  res.json(await Application.find(filter).sort({ appliedOn: -1 }));
}));

app.post('/api/applications', requireAuth, route(async (req, res) => {
  res.status(201).json(await Application.create({ ...req.body, user: req.userId }));
}));

app.put('/api/applications/:id', requireAuth, route(async (req, res) => {
  const updated = await Application.findOneAndUpdate(
    { _id: req.params.id, user: req.userId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!updated) return res.status(404).json({ error: 'Application not found' });
  res.json(updated);
}));

app.delete('/api/applications/:id', requireAuth, route(async (req, res) => {
  const deleted = await Application.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!deleted) return res.status(404).json({ error: 'Application not found' });
  res.json({ deleted: true });
}));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`API running on port ${port}`));
  })
  .catch((err) => console.error('MongoDB connection failed:', err.message));