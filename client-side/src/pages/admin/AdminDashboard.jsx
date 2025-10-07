import {
  membership,
  getCountStudent,
  merchCreated,
  placedOrders,
  fetchAllPendingCounts,
  getCountActiveMemberships,
} from "../../api/admin";
import BarGraph from "./dashboard/BarGraph";
import DashboardCard from "./dashboard/DashboardCard";
import DoughnutChart from "./dashboard/DoughnutChart";
import PieChart from "./dashboard/PieChart";
import {
  faBoxOpen,
  faUserGraduate,
  faShoppingCart,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import OrderTable from "./dashboard/OrderTable";
import React, { useEffect, useState } from "react";
import { InfinitySpin } from "react-loader-spinner";
import { motion } from "framer-motion";

const AdminDashboard = () => {
  const [counts, setCounts] = useState({
    merchandise: 0,
    student: 0,
    order: 0,
    activeMemberships: 0,
  });

  // Pending orders table states
  const [pendingOrder, setPendingOrder] = useState([]); // changed pendingData to pendingOrder for readability
  const [currentPage, setCurrentPage] = useState(1); // indicates current page sa pending order pagination
  const [totalOrders, setTotalOrders] = useState(0); // total order count
  const [limit, setLimit] = useState(10); // limit of pending orders per page (pagination)
  const [totalOrderPages, setTotalOrderPages] = useState(1); // murag way gamit actually HAHAHA
  const [search, setSearch] = useState(""); // search functionality pendingorders
  const [sort, setSort] = useState([]); // sort functionality pendingorders (can sort by multiple columns, asc and desc)

  // Pending orders table loading
  const [orderLoading, setOrderLoading] = useState(false);

  const [finalCounts, setFinalCounts] = useState({
    merchandise: 0,
    student: 0,
    order: 0,
    activeMemberships: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = sessionStorage.getItem("Token");

  const animateCount = () => {
    const increment = Math.ceil(
      Math.max(
        finalCounts.student,
        finalCounts.merchandise,
        finalCounts.order,
        finalCounts.activeMemberships
      ) / 100
    );

    const interval = setInterval(() => {
      setCounts((prevCounts) => {
        const newCounts = {
          student: Math.min(
            prevCounts.student + increment,
            finalCounts.student
          ),
          merchandise: Math.min(
            prevCounts.merchandise + increment,
            finalCounts.merchandise
          ),
          order: Math.min(prevCounts.order + increment, finalCounts.order),
          activeMemberships: Math.min(
            prevCounts.activeMemberships + increment,
            finalCounts.activeMemberships
          ),
        };

        if (
          newCounts.student === finalCounts.student &&
          newCounts.merchandise === finalCounts.merchandise &&
          newCounts.order === finalCounts.order
        ) {
          clearInterval(interval);
        }

        return newCounts;
      });
    }, 20);
  };

  const fetchData = async () => {
    try {
      const [studentRes, merchCreate, placedOrder, activeMemberships] =
        await Promise.all([
          getCountStudent(),
          merchCreated(),
          placedOrders(),
          getCountActiveMemberships(),
        ]);

      setFinalCounts({
        student: studentRes.all || 0,
        merchandise: merchCreate || 0,
        order: placedOrder || 0,
        activeMemberships: activeMemberships || 0,
      });

      animateCount();
    } catch (error) {
      setError("Error fetching dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingCounts = async () => {
    try {
      setOrderLoading(true);
      const sortParam = sort.length > 0 ? JSON.stringify(sort) : undefined;

      const [{ data: pendingOrders, total: totalOrder, totalPages: totalPage }] =
      await Promise.all([
        fetchAllPendingCounts({
          page: currentPage,
          limit,
          sort: sortParam, // ← now a string!
          search,
        }),
      ]);
      
      // console.log('pending orders: ', pendingOrders)
      setPendingOrder(pendingOrders || []);
      setTotalOrders(totalOrder || 0);
      setTotalOrderPages(totalPage || 1);
      // console.log('page sort search', currentPage, sort, search)
    } catch (error) {
      setError("Error fetching pending orders");
    } finally {
      setOrderLoading(false);
    }
  };

  // Caused so much lag kay sge lng ug ga api call every second
  // Recommend: using websockets (implement later)
  // useEffect(() => {
  //   if (!token) return;
  //   const delayFetch = setInterval(() => {
  //     fetchData();
  //   }, 1000);

  //   return () => clearInterval(delayFetch);
  // }, [
  //   finalCounts.student,
  //   finalCounts.merchandise,
  //   finalCounts.order,
  //   finalCounts.activeMemberships,
  // ]);

  useEffect(() => {
    if (!token) return;
    fetchData();
    fetchPendingCounts();
  }, [
    finalCounts.student,
    finalCounts.merchandise,
    finalCounts.order,
    finalCounts.activeMemberships,
    currentPage,
    limit,
    sort,
    search,
  ]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const tableVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        delay: 0.5,
        duration: 0.8,
      },
    },
  };

  return (
    <div className="lg:p-8 p-4">
      {loading ? (
        <div className="flex justify-center items-center h-60vh">
          <InfinitySpin
            visible={true}
            width={200}
            color="#0d6efd"
            ariaLabel="infinity-spin-loading"
          />
        </div>
      ) : (
        <div className="pt-4 md:pt-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="min-w-0 text-center">
              {" "}
              {/* Add min-w-0 to prevent text overflow */}
              <DashboardCard
                icon={faBoxOpen}
                title="Published Merchandise"
                count={counts.merchandise}
                className="text-sm sm:text-base" // Consistent text sizing
              />
            </div>

            <div className="min-w-0 text-center">
              <DashboardCard
                icon={faUserGraduate}
                title="Students"
                count={counts.student}
                className="text-sm sm:text-base"
              />
            </div>

            <div className="min-w-0 text-center">
              <DashboardCard
                icon={faShoppingCart}
                title="Orders"
                count={counts.order}
                className="text-sm sm:text-base"
              />
            </div>

            <div className="min-w-0 text-center">
              <DashboardCard
                icon={faUsers}
                title="Active Memberships"
                count={counts.activeMemberships}
                className="text-sm sm:text-base"
              />
            </div>
          </div>
          <div className="px-4">
            <motion.div
              className="flex flex-col lg:flex-row lg:flex-wrap items-center mt-8 pt-2 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {/* Bar Graph */}
              <motion.div
                className="flex-1 flex items-center justify-center bg-white rounded-lg shadow-sm p-6 max-lg:w-full w-full"
                variants={itemVariants}
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="">
                  <BarGraph className="" />
                </div>
              </motion.div>

              {/* Doughnut Chart */}
              <motion.div
                className="flex-1 flex items-center justify-center bg-white rounded-lg shadow-sm p-6 max-lg:w-full w-full"
                variants={itemVariants}
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div>
                  <DoughnutChart className="" />
                </div>
              </motion.div>

              {/* Pie Chart */}
              <motion.div
                className="flex-1 flex items-center justify-center mb-4 bg-white rounded-lg shadow-sm p-6 max-lg:w-full"
                variants={itemVariants}
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <PieChart className="w-full h-96" />
              </motion.div>
            </motion.div>

            {/* Order Table */}
            <motion.div
              className="justify-center items-center mt-8 pt-2"
              variants={tableVariants}
              initial="hidden"
              animate="show"
            >
              <motion.h4
                className="mb-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                Pending Orders
              </motion.h4>
              <OrderTable
                data={pendingOrder}
                total={totalOrders}
                page={currentPage}
                limit={limit}
                onSortChange={setSort}
                onSearch={setSearch}
                onPageChange={(newPage, newLimit) => {
                  setCurrentPage(newPage);
                  if (newLimit !== limit) setLimit(newLimit);
                }}
                loading={orderLoading}
              />
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
