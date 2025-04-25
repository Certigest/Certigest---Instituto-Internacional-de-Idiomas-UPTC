import axios from 'axios';

const BASE_URL = 'http://localhost:8080/course';

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
