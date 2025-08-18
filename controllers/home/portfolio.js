// packages
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

// imports
import User from "../../models/user.js";

// init
const url = process.env.API_URL;

const addImage = async (req, res) => {
  try {
    const userId = req.userId;
    const imagePath = req.file.path; // new uploaded image
    const existingUser = await User.findById(userId);

    if (!existingUser) {
      return res.status(400).json({ message: "user not exist" });
    }

    // Store the old image before updating
    const oldImagePath = existingUser.image;

    // Update DB with new image
    await User.updateOne({ _id: userId }, { $set: { image: imagePath } });

    // Delete old image if it exists and is not the default one
    if (oldImagePath && !oldImagePath.includes("simple.jpg")) {
      const absoluteOldPath = path.join(__dirname, "..", oldImagePath); 
      if (fs.existsSync(absoluteOldPath)) {
        fs.unlinkSync(absoluteOldPath);
      }
    }

    return res.status(200).json({ message: "image added successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


const userData = async (req, res) => {
  try {
    const userId = req.userId;

    const existingUser = await User.findOne(
      { _id: userId },
      {
        name: 1,
        email: 1,
        gender: 1,
        image: 1,
        type: 1,
        address: 1,
        phone: 1,
      }
    );
    if (existingUser) {
      return res.status(200).json({ message: existingUser });
    } else {
      return res.status(404).json({ message: "user not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const editUserData = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, email, gender, image, type, address, phone } = req.body;
    let query = {};

    if (name) {
      query.name = name;
    }
    if (email) {
      query.email = email;
    }
    if (gender) {
      query.gender = gender;
    }
    if (image) {
      query.image = image;
    }
    if (type) {
      query.type = type;
    }
    if (address) {
      query.address = address;
    }
    if (phone) {
      query.phone = phone;
    }
    await User.updateOne({ _id: userId }, { $set: query });

    return res.status(200).json({ message: "User data updated successfuly" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export { addImage, userData, editUserData };
