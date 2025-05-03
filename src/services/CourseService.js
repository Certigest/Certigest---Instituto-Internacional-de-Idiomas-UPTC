import axios from 'axios';

const API_HOST = process.env.REACT_APP_API_HOST;

const BASE_URL = `${API_HOST}/course`;

export async function createCourse(courseData, token) {
  const response = await axios.post(`${BASE_URL}/createCourse`, courseData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

export async function getAllCourses(token) {
  const response = await axios.get(`${BASE_URL}/all`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}
