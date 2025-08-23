const bcrypt = require("bcryptjs");
const Student = require("../models/StudentModel");
const Admin = require("../models/AdminModel");
const Orders = require("../models/OrdersModel");
const Log = require("../models/LogModel");
const MembershipHistory = require("../models/history,model");
const { format } = require("date-fns");

const mongoose = require("mongoose");

const getAllActiveStudentsController = async (req, res) => {
  try {
    const students = await Student.find({
      status: "True",
    });
    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json("Internal Server Error");
  }
};

const setStudentMembershipRequest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id_number } = req.body;

    const studentFind = await Student.findOne({ id_number: id_number }).session(
      session
    );

    if (studentFind.membershipStatus !== "NOT_APPLIED") {
      return res
        .status(400)
        .json({ message: "You already have a pending request." });
    }

    await Student.updateOne({ id_number: id_number }, [
      {
        $set: {
          membershipStatus: "PENDING",
        },
      },
    ]).session(session);

    await session.commitTransaction();
    session.endSession();
    res.status(200).json({ message: "Request submitted successfully" });
  } catch (error) {
    session.abortTransaction();
    session.endSession();
    res
      .status(500)
      .json({ message: "Error submitting request", error: error.message });
  }
};

const getAllDeleteStudentController = async (req, res) => {
  try {
    const students = await Student.find({
      status: "False",
    });
    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json("Internal Server Error");
  }
};

const getMembershipStatusController = async (req, res) => {
  const { id } = req.params;
  try {
    const student = await Student.findOne({ id_number: id });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({
      status: student.membershipStatus,
      isFirstApplication: student.isFirstApplication,
    });
  } catch (error) {
    console.error("Error fetching student:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const softDeleteStudentController = async (req, res) => {
  const { id_number, name } = req.body;

  try {
    // Find and delete the student by id_number
    const deletedStudent = await Student.updateOne(
      { id_number: id_number },
      {
        $set: {
          status: "False",
          deletedBy: name,
          deletedDate: format(new Date(), "MMMM d, yyyy h:mm:ss a"),
        },
      }
    );

    if (!deletedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json("Internal Server Error");
  }
};

const restoreDeletedStudentController = async (req, res) => {
  const { id_number } = req.body;

  try {
    const restore = await Student.updateOne(
      { id_number: id_number },
      {
        $set: {
          status: "True",
        },
      }
    );

    if (!restore) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({ message: "Student retore successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json("Internal Server Error");
  }
};
const cancelMembershipRequestController = async (req, res) => {
  const { id_number } = req.body;

  try {
    const cancel = await Student.updateOne(
      { id_number: id_number },
      {
        $set: {
          membershipStatus: "NOT_APPLIED",
        },
      }
    );

    if (!cancel) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({ message: "Student cancel membership successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json("Internal Server Error");
  }
};

const editStudentController = async (req, res) => {
  const {
    id_number,
    rfid,
    first_name,
    middle_name,
    last_name,
    email,
    course,
    year,
  } = req.body;

  try {
    // Fetch the student document by id_number to get the _id
    const student = await Student.findOne({ id_number: id_number });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Update the student's information
    const studentResult = await Student.updateOne(
      { id_number: id_number },
      {
        $set: {
          rfid: rfid,
          first_name: first_name,
          middle_name: middle_name,
          last_name: last_name,
          email: email,
          course: course,
          year: year,
        },
      }
    );

    // Update related orders with the new student details
    await Orders.updateMany(
      { id_number: id_number },
      {
        $set: {
          student_name: `${first_name} ${middle_name} ${last_name}`,
          course: course,
          year: year,
          rfid: rfid,
        },
      }
    );

    // Log the editing action
    const log = new Log({
      admin: req.user.name,
      admin_id: req.user._id,
      action: "Edited Student",
      target: `${id_number} - ${first_name} ${middle_name} ${last_name}`,
      target_id: student._id,
      target_model: "Student",
    });

    await log.save();
    //console.log("Action logged successfully.");

    res
      .status(200)
      .json({ message: "Student and related orders updated successfully" });
  } catch (error) {
    console.error("Error updating student and orders:", error);
    res.status(500).json("Internal Server Error");
  }
};
const changeStudentPassword = async (req, res) => {
  try {
    const getStudent = await Student.findOne({
      id_number: req.body.id_number,
    });

    if (!getStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    getStudent.password = hashedPassword;
    await getStudent.save();

    // Log the password change action
    const log = new Log({
      admin: req.user.name,
      admin_id: req.user._id,
      action: "Changed Student Password",
      target: `${getStudent.id_number} - ${getStudent.first_name} ${getStudent.middle_name} ${getStudent.last_name}`,
      target_id: getStudent._id,
      target_model: "Student",
    });

    await log.save();
    //console.log("Action logged successfully.");

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing student password:", error);
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

const fetchSpecificStudentController = async (req, res) => {
  const { id_number } = req.params;

  try {
    const student = await Student.findOne({ id_number });
    if (!student) {
      res.status(404).json({ message: "Student not found" });
    } else {
      const user = {
        isRequest: student.isRequest,
        role: student.role,
      };
      res.status(200).json({ data: user });
    }
  } catch (error) {
    console.error(error);
  }
};

const fetchSpecificMembershipHistoryController = async (req, res) => {
  const { id_number } = req.params;

  try {
    const membershipHistory = await MembershipHistory.find({
      id_number: id_number,
    }).sort({ date: -1 });

    res.status(200).json({ data: membershipHistory });
  } catch (error) {
    console.error("Error fetching student membership history:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  getAllActiveStudentsController,
  setStudentMembershipRequest,
  getAllDeleteStudentController,
  getMembershipStatusController,
  softDeleteStudentController,
  restoreDeletedStudentController,
  cancelMembershipRequestController,
  editStudentController,
  changeStudentPassword,
  fetchSpecificStudentController,
  fetchSpecificMembershipHistoryController,
};
