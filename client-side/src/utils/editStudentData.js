export const setStudentData = ({ student }) => {
  const editedStudent = {
    rfid: student.rfid,
    first_name: student.first_name,
    middle_name: student.middle_name,
    last_name: student.last_name,
    id_number: student.id_number,
    email: student.email,
    course: student.course,
    year: student.year,
  };
  localStorage.setItem("EditStudentToken", JSON.stringify(editedStudent));
};

//Retrive Token sa Private Route, every route e check if valid pa ang token
export const getStudentData = () => {
  const student = localStorage.getItem("EditStudentToken");
  if (!student) return null;

  return student;
};
export const removeStudentData = () => {
  localStorage.removeItem("EditStudentToken");
};
