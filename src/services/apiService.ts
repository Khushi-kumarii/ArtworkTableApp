import axios from 'axios';

const BASE_URL = 'https://api.artic.edu/api/v1/artworks';

export const fetchArtworks = async (page: number = 1) => {
  try {
    const response = await axios.get(`${BASE_URL}?page=${page}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching artworks:", error);
    throw error;
  }
};
