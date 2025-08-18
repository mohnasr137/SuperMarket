// imports
import User from "../../models/user.js";
import axios from "axios";

// controllers
const getCart = async (req, res) => {
  try {
    const userId = req.userId;
    const existingUser = await User.findById(userId);

    if (!existingUser) {
      return res.status(400).json({ message: "user not exist" });
    }

    return res.status(200).json({ list: existingUser.cart });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getFavorite = async (req, res) => {
  try {
    const userId = req.userId;
    const existingUser = await User.findById(userId);

    if (!existingUser) {
      return res.status(400).json({ message: "user not exist" });
    }

    return res.status(200).json({ list: existingUser.favorite });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const addCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.body;

    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(400).json({ message: "user not exist" });
    }

    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ message: "Authorization token required" });
    }

    const request = await axios.get(
      `http://localhost:5000/api/v1/home/products/${productId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );
    const product = request.data;
    if (!product) {
      return res.status(400).json({ message: "product not exist" });
    }

    // ✅ check by product._id instead of item._id (since we store object)
    const isProductInCart = existingUser.cart.some(
      (item) => item.id?.toString() === product.id.toString()
    );

    if (!isProductInCart) {
      existingUser.cart.push(product);
      await existingUser.save();
    }

    return res.status(200).json({ message: "add to cart successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const addFavorite = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.body;

    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(400).json({ message: "user not exist" });
    }

    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ message: "Authorization token required" });
    }

    const request = await axios.get(
      `http://localhost:5000/api/v1/home/products/${productId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );
    const product = request.data;
    if (!product) {
      return res.status(400).json({ message: "product not exist" });
    }

    // ✅ same fix here
    const isProductInFavorites = existingUser.favorite.some(
      (item) => item.id?.toString() === product.id.toString()
    );

    if (!isProductInFavorites) {
      existingUser.favorite.push(product);
      await existingUser.save();
    }

    return res.status(200).json({ message: "add to favorite successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.body;

    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(400).json({ message: "user not exist" });
    }

    // ✅ filter by stored object._id
    const updatedCart = existingUser.cart.filter(
      (item) => item.id?.toString() !== productId
    );

    existingUser.cart = updatedCart;
    await existingUser.save();

    return res.status(200).json({ message: "delete from cart successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteFavorite = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.body;

    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(400).json({ message: "user not exist" });
    }

    // ✅ filter by stored object._id
    const updatedFavorites = existingUser.favorite.filter(
      (item) => item.id?.toString() !== productId
    );

    existingUser.favorite = updatedFavorites;
    await existingUser.save();

    return res
      .status(200)
      .json({ message: "delete from favorite successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export {
  getCart,
  getFavorite,
  addCart,
  addFavorite,
  deleteCart,
  deleteFavorite,
};
