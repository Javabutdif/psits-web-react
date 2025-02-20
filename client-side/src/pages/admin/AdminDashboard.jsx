import {
  membership,
  allMembers,
  merchCreated,
  placedOrders,
} from "../../api/admin";
import BarGraph from "./dashboard/BarGraph";
import DashboardCard from "./dashboard/DashboardCard";
import DoughnutChart from "./dashboard/DoughnutChart";
import PieChart from "./dashboard/PieChart";
import {
  faBoxOpen,
  faUserGraduate,
  faShoppingCart,
} from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useState } from "react";

const AdminDashboard = () => {
  useEffect(() => {
    const hasReloaded = sessionStorage.getItem("hasReloaded");

    if (!hasReloaded) {
      sessionStorage.setItem("hasReloaded", "true");
      window.location.reload();
    }
  }, []);
  const [counts, setCounts] = useState({
    merchandise: 0,
    student: 0,
    order: 0,
  });

  const [finalCounts, setFinalCounts] = useState({
    merchandise: 0,
    student: 0,
    order: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const animateCount = () => {
    const increment = Math.ceil(
      Math.max(
        finalCounts.student,
        finalCounts.merchandise,
        finalCounts.order
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentRes, merchCreate, placedOrder] = await Promise.all([
          allMembers(),
          merchCreated(),
          placedOrders(),
        ]);

        setFinalCounts({
          student: studentRes || 0,
          merchandise: merchCreate || 0,
          order: placedOrder || 0,
        });
        console.log(studentRes);
        animateCount();
      } catch (error) {
        setError("Error fetching dashboard data");
      } finally {
        setLoading(false);
      }
    };

    const delayFetch = setInterval(() => {
      fetchData();
    }, 1000);

    return () => clearInterval(delayFetch);
  }, [finalCounts.student, finalCounts.merchandise, finalCounts.order]);
  return (
    <div className="pt-4 md:pt-8">
      <div className="grid grid-cols-4 md:grid-cols-6 gap-4 md:gap-8 text-center lg:flex lg:justify-between">
        <div className="col-start-1 col-end-3 lg:flex-1 md:col-start-1 md:col-end-3">
          <DashboardCard
            icon={faBoxOpen}
            title="Merchandise Created"
            count={counts.merchandise}
          />
        </div>
        <div className="col-start-3 col-end-5 lg:flex-1 md:col-start-3 md:col-end-5">
          <DashboardCard
            icon={faUserGraduate}
            title="Students"
            count={counts.student}
          />
        </div>
        <div className="row-start-2 col-span-full md:row-start-1 md:col-start-5 lg:flex-1">
          <DashboardCard
            icon={faShoppingCart}
            title="Orders"
            count={counts.order}
          />
        </div>
      </div>
      <div className="flex flex-col xl:flex-row items-center mt-8 pt-2 gap-8">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-6xl flex items-center justify-center">
            <BarGraph className="w-full h-96" />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <DoughnutChart className="w-64 h-64" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <PieChart className="w-64 h-64" />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
