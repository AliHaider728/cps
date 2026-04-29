import React, { useState, useEffect } from 'react';
import { MapPin, CheckCircle, XCircle, Clock, Calendar, Users, TrendingUp, Award, Coffee, Target, AlertCircle, ChevronDown } from "lucide-react";

const AttendanceEmployee = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [workingHours, setWorkingHours] = useState("00:00:00");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      if (checkInTime) {
        const diff = new Date() - checkInTime;
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setWorkingHours(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [checkInTime]);

  const attendanceHistory = [
    {
      date: "14 Sep 2025",
      checkIn: "09:00 AM",
      checkOut: "06:30 PM",
      break: "45 Min",
      workHours: "8.75 Hrs",
      status: "Present",
      production: "10.00 Hrs",
      overtime: "1.25 Hrs"
    },
    {
      date: "13 Sep 2025",
      checkIn: "09:15 AM",
      checkOut: "06:45 PM",
      break: "30 Min",
      workHours: "9.00 Hrs",
      status: "Late",
      production: "9.30 Hrs",
      overtime: "1.30 Hrs"
    },
    {
      date: "12 Sep 2025",
      checkIn: "09:00 AM",
      checkOut: "06:00 PM",
      break: "60 Min",
      workHours: "8.00 Hrs",
      status: "Present",
      production: "8.00 Hrs",
      overtime: "0.00 Hrs"
    },
    {
      date: "11 Sep 2025",
      checkIn: "-",
      checkOut: "-",
      break: "-",
      workHours: "0.00 Hrs",
      status: "Absent",
      production: "0.00 Hrs",
      overtime: "0.00 Hrs"
    },
    {
      date: "10 Sep 2025",
      checkIn: "09:30 AM",
      checkOut: "06:30 PM",
      break: "45 Min",
      workHours: "8.25 Hrs",
      status: "Late",
      production: "8.25 Hrs",
      overtime: "0.25 Hrs"
    },
  ];

  const handleCheckIn = () => {
    setIsCheckedIn(true);
    setCheckInTime(new Date());
  };

  const handleCheckOut = () => {
    setIsCheckedIn(false);
    setCheckInTime(null);
    setWorkingHours("00:00:00");
  };

  return (
    <div className="min-h-screen bg-primary overflow-x-hidden">
      {/* Header Section - Aligned with StaffList style */}
      <div className="bg-secondary rounded-xl shadow-sm border border-[var(--border-color)] p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              My Attendance
            </h1>
            <p className="text-secondary text-xs mt-0.5">Track your daily attendance and working hours</p>
          </div>
          {/* User Profile Area */}
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&h=48&fit=crop&crop=face&auto=format"
                  alt="Profile"
                  className="w-12 h-12 rounded-lg object-cover border border-white"
                />
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-primary">John Doe</div>
              <div className="text-xs text-secondary">Software Engineer</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Time Display Card - Updated with soft borders and shadows */}
        <div className="bg-secondary rounded-xl shadow-sm border border-[var(--border-color)] p-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-primary mb-2 font-mono">
              {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </div>
            <div className="text-lg text-secondary mb-6">
              {currentTime.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
           
            <div className="flex items-center justify-center gap-6 mb-6">
              <div className="flex items-center gap-2 text-secondary bg-primary px-4 py-2 rounded-lg border border-[var(--border-color)]">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Office Location</span>
              </div>
            </div>
            <div className="flex justify-center gap-6">
              {!isCheckedIn ? (
                <button
                  onClick={handleCheckIn}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg text-sm font-medium"
                >
                  <CheckCircle className="w-5 h-5" />
                  Check In
                </button>
              ) : (
                <button
                  onClick={handleCheckOut}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg hover:from-red-700 hover:to-rose-700 transition-all shadow-md hover:shadow-lg text-sm font-medium"
                >
                  <XCircle className="w-5 h-5" />
                  Check Out
                </button>
              )}
            </div>
            {isCheckedIn && checkInTime && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-green-800 text-sm font-medium">
                    Checked in at {checkInTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div className="mt-2 text-green-700 font-mono text-lg text-center">
                  Working Time: {workingHours}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Summary - Aligned style */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-secondary rounded-xl shadow-sm border border-[var(--border-color)] p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <Calendar className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="text-lg font-bold text-primary">Today's Summary</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-secondary font-medium">Check In</span>
                  <span className="font-semibold text-primary">
                    {isCheckedIn ? checkInTime?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-secondary font-medium">Check Out</span>
                  <span className="font-semibold text-primary">--:--</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-secondary font-medium">Break Time</span>
                  <span className="font-semibold text-primary">00:00</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-secondary font-medium">Work Hours</span>
                  <span className="font-semibold text-green-600">{workingHours}</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-secondary font-medium">Status</span>
                  <span className={`font-semibold text-sm ${isCheckedIn ? "text-green-600" : "text-gray-600"}`}>
                    {isCheckedIn ? "Present" : "Not Checked In"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-secondary rounded-xl shadow-sm border border-[var(--border-color)] p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-primary">This Week</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-secondary font-medium">Total Work Hours</span>
                  <span className="font-semibold text-primary">34.00 Hrs</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-secondary font-medium">Present Days</span>
                  <span className="font-semibold text-green-600">4</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-secondary font-medium">Absent Days</span>
                  <span className="font-semibold text-red-600">1</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-secondary font-medium">Late Days</span>
                  <span className="font-semibold text-orange-600">2</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-secondary font-medium">Overtime</span>
                  <span className="font-semibold text-orange-600">2.80 Hrs</span>
                </div>
              </div>
            </div>

            {/* Statistics Cards - Gradient backgrounds */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-secondary rounded-xl shadow-sm border border-[var(--border-color)] p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl mx-auto mb-3 flex items-center justify-center shadow-md">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-primary mb-1">95%</div>
                <div className="text-xs text-secondary">Attendance</div>
              </div>
              <div className="bg-secondary rounded-xl shadow-sm border border-[var(--border-color)] p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl mx-auto mb-3 flex items-center justify-center shadow-md">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-primary mb-1">8.2</div>
                <div className="text-xs text-secondary">Avg Hours</div>
              </div>
            </div>
          </div>

          {/* Attendance History - Table style aligned */}
          <div className="lg:col-span-2 bg-secondary rounded-xl shadow-sm border border-[var(--border-color)] overflow-hidden">
            <div className="p-6 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                  <Clock className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-primary">Attendance History</h3>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-primary">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-secondary uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-secondary uppercase">Check In</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-secondary uppercase">Check Out</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-secondary uppercase">Break</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-secondary uppercase">Work Hours</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-secondary uppercase">Production</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-secondary uppercase">Overtime</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-secondary uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {attendanceHistory.map((record, index) => (
                    <tr key={index} className="hover:bg-blue-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-primary">{record.date}</td>
                      <td className="px-6 py-4 text-sm text-secondary">{record.checkIn}</td>
                      <td className="px-6 py-4 text-sm text-secondary">{record.checkOut}</td>
                      <td className="px-6 py-4 text-sm text-secondary">{record.break}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-primary">{record.workHours}</td>
                      <td className="px-6 py-4 text-sm text-orange-600">{record.production}</td>
                      <td className="px-6 py-4 text-sm text-purple-600">{record.overtime}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                            record.status === "Present"
                              ? "bg-green-50 text-green-600 border border-green-200"
                              : record.status === "Late"
                                ? "bg-orange-50 text-orange-600 border border-orange-200"
                                : "bg-red-50 text-red-600 border border-red-200"
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Monthly Overview Cards - Gradient aligned */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-secondary rounded-xl shadow-sm border border-[var(--border-color)] p-4 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl mx-auto mb-3 flex items-center justify-center shadow-md">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-primary mb-1">22</div>
            <div className="text-xs text-secondary">Working Days</div>
            <div className="mt-1 text-xs text-green-600">This Month</div>
          </div>
         
          <div className="bg-secondary rounded-xl shadow-sm border border-[var(--border-color)] p-4 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl mx-auto mb-3 flex items-center justify-center shadow-md">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-primary mb-1">20</div>
            <div className="text-xs text-secondary">Present Days</div>
            <div className="mt-1 text-xs text-green-600">91% Attendance</div>
          </div>
         
          <div className="bg-secondary rounded-xl shadow-sm border border-[var(--border-color)] p-4 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl mx-auto mb-3 flex items-center justify-center shadow-md">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-primary mb-1">2</div>
            <div className="text-xs text-secondary">Late Arrivals</div>
            <div className="mt-1 text-xs text-orange-600">9% of Days</div>
          </div>
         
          <div className="bg-secondary rounded-xl shadow-sm border border-[var(--border-color)] p-4 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl mx-auto mb-3 flex items-center justify-center shadow-md">
              <Coffee className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-primary mb-1">18.5</div>
            <div className="text-xs text-secondary">Break Hours</div>
            <div className="mt-1 text-xs text-purple-600">Total This Month</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceEmployee;