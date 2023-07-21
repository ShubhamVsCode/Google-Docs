const Document = require("../model/documentModel");
const User = require("../model/userModel");

async function create(req, res) {
  try {
    const { title, content, createdBy } = req.body;

    const document = new Document({
      title: title ?? "Untitled",
      content,
      createdBy: req.userId,
    });
    await document.save();

    const user = await User.findById(req.userId);
    user.documents.push(document);
    await user.save();

    res
      .status(201)
      .json({ message: "Document created successfully", document });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to create document", error });
  }
}

async function getById(req, res) {
  try {
    const documentId = req.params.id;

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.status(200).json({ document });
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve document", error });
  }
}

async function update(req, res) {
  try {
    const documentId = req.params.id;
    const { title, content } = req.body;

    const document = await Document.findByIdAndUpdate(
      documentId,
      { title, content },
      { new: true }
    );
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    res
      .status(200)
      .json({ message: "Document updated successfully", document });
  } catch (error) {
    res.status(500).json({ message: "Failed to update document", error });
  }
}

async function remove(req, res) {
  try {
    const documentId = req.params.id;

    const document = await Document.findByIdAndRemove(documentId);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.status(200).json({ message: "Document deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete document", error });
  }
}

module.exports = { create, getById, update, remove };
