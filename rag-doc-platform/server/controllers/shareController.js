import ChatShare from '../models/ChatShare.js';
import crypto from 'crypto';

function generateShareId() {
  return crypto.randomBytes(8).toString('hex');
}

export async function createShareableLink(req, res) {
  try {
    const { content, documentName, documentCategory } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const shareId = generateShareId();

    const chatShare = new ChatShare({
      content,
      shareId,
      documentName,
      documentCategory,
    });

    await chatShare.save();

    const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/share/${shareId}`;

    res.json({
      shareUrl,
      shareId,
      expiresAt: chatShare.expiresAt,
    });
  } catch (error) {
    console.error('Share creation error:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function getSharedChat(req, res) {
  try {
    const { shareId } = req.params;

    if (!shareId) {
      return res.status(400).json({ error: 'Share ID is required' });
    }

    const chatShare = await ChatShare.findOne({ shareId });

    if (!chatShare) {
      return res.status(404).json({ error: 'Shared chat not found or has expired' });
    }

    // Increment view count
    chatShare.viewCount += 1;
    await chatShare.save();

    res.json({
      content: chatShare.content,
      documentName: chatShare.documentName,
      documentCategory: chatShare.documentCategory,
      createdAt: chatShare.createdAt,
      viewCount: chatShare.viewCount,
    });
  } catch (error) {
    console.error('Share fetch error:', error);
    res.status(500).json({ error: error.message });
  }
}

export default { createShareableLink, getSharedChat };
