import axios from 'axios';

const API_HOST = process.env.REACT_APP_API_HOST;

const COURSE_URL = `${API_HOST}/course`;
const LEVEL_URL = `${API_HOST}/level`;
const GROUP_URL = `${API_HOST}/group`;

export async function createCourse(courseData, token) {
  const response = await axios.post(`${COURSE_URL}/createCourse`, courseData, {
    headers: { Authorization: `Bearer ${token}` }
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

export async function updateCourse(courseData, token) {
  const response = await axios.put(`${COURSE_URL}/update`, courseData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

export async function updateLevel(levelData, token) {
  const response = await axios.put(`${LEVEL_URL}/update`, levelData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

export async function updateGroup(groupData, token) {
  const response = await axios.put(`${GROUP_URL}/update`, groupData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

export async function deleteCourse(courseId, token) {
  const response = await axios.delete(`${COURSE_URL}/${courseId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

export async function deleteLevel(levelId, token) {
  const response = await axios.delete(`${LEVEL_URL}/${levelId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

export async function deleteGroup(groupId, token) {
  const response = await axios.delete(`${GROUP_URL}/${groupId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

export async function getAllCourses(token) {
  const response = await axios.get(`${COURSE_URL}/all`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

export async function getAllLevels(token) {
  const response = await axios.get(`${LEVEL_URL}/all`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

export async function getAllGroups(token) {
  const response = await axios.get(`${GROUP_URL}/all`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return response.data;
}

export async function getAllTeachers(token) {
  const response = await axios.get(`${API_HOST}/person/teachers`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

export async function getAllStudents(token) {
  const response = await axios.get(`${API_HOST}/person/students`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
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

export async function getLevelsByCourse(token, id) {
  const response = await axios.get(`${LEVEL_URL}/by-course/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return response.data;
}

export async function getGroupsByLevel(token, id) {
  const response = await axios.get(`${GROUP_URL}/by-level/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return response.data;
}

export const removeStudentFromGroup = async (groupId, studentId, token) => {
  const response = await fetch(
    `${GROUP_URL}/${groupId}/student/${studentId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    throw new Error('Error al eliminar al estudiante del grupo');
  }
};

export async function enrollStudentToGroup(token, studentId, groupId) {
  const response = await axios.post(
    `${GROUP_URL}/enroll/${studentId}/${groupId}`,
    {}, // cuerpo vacío
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return response.data;
}