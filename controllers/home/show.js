// packages
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

// init
const url = process.env.API_URL;
const DUMMY_JSON_BASE_URL = "https://dummyjson.com";

// routers
const allProducts = async (req, res) => {
  try {
    let { skip = 0, limit = 10, sortBy, order, select } = req.query;

    // Build query parameters
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
    });

    if (sortBy && order) {
      params.append("sortBy", sortBy);
      params.append("order", order);
    }

    if (select) {
      params.append("select", select);
    }

    const response = await axios.get(
      `${DUMMY_JSON_BASE_URL}/products?${params}`
    );
    return res.status(200).json({
      list: response.data.products,
      total: response.data.total,
      skip: response.data.skip,
      limit: response.data.limit,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const allProductsFilter = async (req, res) => {
  try {
    const {
      skip = 0,
      search,
      brand,
      category,
      rating,
      price,
      discount,
      popular,
      limit = 10,
    } = req.body;

    let apiUrl = `${DUMMY_JSON_BASE_URL}/products`;
    let params = new URLSearchParams({
      skip: (skip * 10).toString(),
      limit: limit.toString(),
    });

    // Handle search functionality
    if (search) {
      apiUrl = `${DUMMY_JSON_BASE_URL}/products/search`;
      params.append("q", search);
    }

    // Handle category filtering
    if (category) {
      apiUrl = `${DUMMY_JSON_BASE_URL}/products/category/${category}`;
    }

    // Handle sorting
    if (rating) {
      params.append("sortBy", "rating");
      params.append("order", rating === "up" ? "asc" : "desc");
    } else if (price) {
      params.append("sortBy", "price");
      params.append("order", price === "up" ? "asc" : "desc");
    } else if (discount) {
      params.append("sortBy", "discountPercentage");
      params.append("order", discount === "up" ? "asc" : "desc");
    } else if (popular) {
      params.append("sortBy", "rating");
      params.append("order", "desc");
    }

    const response = await axios.get(`${apiUrl}?${params}`);
    let products = response.data.products || [];

    // Client-side filtering for brand (since DummyJSON doesn't support brand filtering directly)
    if (brand) {
      products = products.filter(
        (product) =>
          product.brand &&
          product.brand.toLowerCase().includes(brand.toLowerCase())
      );
    }

    if (products.length === 0) {
      return res.status(404).json({ message: "No results found." });
    } else {
      return res.status(200).json({
        list: products,
        total: response.data.total || products.length,
        skip: response.data.skip || skip,
        limit: response.data.limit || limit,
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const allCategories = async (req, res) => {
  try {
    // Get all categories with details
    const response = await axios.get(`${DUMMY_JSON_BASE_URL}/products/categories`);
    const list = response.data;

    if (list.length === 0) {
      return res.status(404).json({ message: "there is no result" });
    } else {
      return res.status(200).json({ list });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const allCategoriesFilter = async (req, res) => {
  try {
    // Get category list (just names)
    const response = await axios.get(`${DUMMY_JSON_BASE_URL}/products/category-list`);
    const list = response.data.map((categoryName) => ({
      name: categoryName,
    }));
    return res.status(200).json({ list });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getSingleProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(`${DUMMY_JSON_BASE_URL}/products/${id}`);
    return res.status(200).json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(500).json({ message: error.message });
  }
};

const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    let { skip = 0, limit = 10 } = req.query;

    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
    });

    const response = await axios.get(
      `${DUMMY_JSON_BASE_URL}/products/category/${category}?${params}`
    );
    return res.status(200).json({
      list: response.data.products,
      total: response.data.total,
      skip: response.data.skip,
      limit: response.data.limit,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const addProduct = async (req, res) => {
  try {
    const productData = req.body;
    const response = await axios.post(
      `${DUMMY_JSON_BASE_URL}/products/add`,
      productData,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return res.status(201).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const method = req.method.toLowerCase() === "patch" ? "PATCH" : "PUT";

    const response = await axios({
      method,
      url: `${DUMMY_JSON_BASE_URL}/products/${id}`,
      data: updateData,
      headers: { "Content-Type": "application/json" },
    });

    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.delete(
      `${DUMMY_JSON_BASE_URL}/products/${id}`
    );
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export {
  allProducts,
  allProductsFilter,
  allCategories,
  allCategoriesFilter,
  getSingleProduct,
  getProductsByCategory,
  addProduct,
  updateProduct,
  deleteProduct,
};
