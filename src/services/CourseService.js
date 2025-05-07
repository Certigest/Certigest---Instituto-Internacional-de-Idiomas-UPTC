import axios from 'axios';

const API_HOST = process.env.REACT_APP_API_HOST;

const BASE_URL = `${API_HOST}/course`;
const LEVEL_URL = `${API_HOST}/level`;
const GROUP_URL = `${API_HOST}/group`;

export async function createCourse(courseData, token) {
  const response = await axios.post(`${BASE_URL}/createCourse`, courseData, {
    headers: { Authorization: `Bearer ${token}` }
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

export async function createLevel(levelData, token) {
  const response = await axios.post(`${LEVEL_URL}/createLevel`, levelData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

export async function createGroup(groupData, token) {
  const response = await axios.post(`${GROUP_URL}/createGroup`, groupData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

export async function getGroupsByTeacher(token) {
  const response = await axios.get(`${GROUP_URL}/teacher`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

export async function getStudentsByGroupId(groupId, token) {
  const response = await axios.get(`${GROUP_URL}/studentsGroup/${groupId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

export async function sendCalifications(groupId, token, califications) {
  await axios.post(`${GROUP_URL}/qualifyGroup/${groupId}`, califications, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
}