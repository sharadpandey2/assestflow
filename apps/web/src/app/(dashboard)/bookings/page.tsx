"use client";

import React, { useState } from "react";
import { useApp, ResourceBooking } from "@/context/AppContext";
import {
  CalendarDays,
  Clock,
  Plus,
  Trash2,
  Calendar,
  Layers,
  MapPin,
  CheckCircle,
  AlertCircle,
  XCircle,
  HelpCircle
} from "lucide-react";

export default function BookingsPage() {
  const {
    currentUser,
    assets,
    bookings,
    employees,
    departments,
    createBooking,
    cancelBooking,
  } = useApp();

  // Shared Bookable Resources list
  const bookableResources = assets.filter((a) => a.isSharedBookable);

  // Active Selected Resource for calendar view
  const [selectedResourceId, setSelectedResourceId] = useState(bookableResources[0]?.id || "");

  // Booking Form Modal State
  const [showFormModal, setShowFormModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    assetId: selectedResourceId || bookableResources[0]?.id || "",
    bookedById: currentUser.id,
    bookedForDepartmentId: currentUser.departmentId || "",
    startTime: "2026-07-12T14:00",
    endTime: "2026-07-12T15:00",
  });

  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!bookingForm.assetId || !bookingForm.startTime || !bookingForm.endTime) {
      setFormError("Please fill out all fields.");
      return;
    }

    const start = new Date(bookingForm.startTime);
    const end = new Date(bookingForm.endTime);

    if (start >= end) {
      setFormError("Invalid range: Start time must precede end time.");
      return;
    }

    const res = await createBooking({
      assetId: bookingForm.assetId,
      bookedById: bookingForm.bookedById,
      bookedForDepartmentId: bookingForm.bookedForDepartmentId || undefined,
      startTime: bookingForm.startTime,
      endTime: bookingForm.endTime,
    });

    if (res.success) {
      setFormSuccess("Booking confirmed successfully!");
      // Reset form
      setBookingForm({
        assetId: selectedResourceId,
        bookedById: currentUser.id,
        bookedForDepartmentId: currentUser.departmentId || "",
        startTime: "2026-07-12T14:00",
        endTime: "2026-07-12T15:00",
      });
      setTimeout(() => {
        setShowFormModal(false);
        setFormSuccess("");
      }, 1000);
    } else {
      setFormError(res.error || "Conflict detected.");
    }
  };

  const getResourceName = (id: string) => assets.find((a) => a.id === id)?.name || id;

  const getBookedByName = (id: string) => employees.find((e) => e.id === id)?.name || "Unknown User";

  // Filter bookings for the selected resource
  const resourceBookings = bookings
    .filter((b) => b.assetId === selectedResourceId)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const activeResource = bookableResources.find((r) => r.id === selectedResourceId);

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">Resource Booking</h1>
          <p className="text-xs text-slate-500 mt-1">Book conference rooms, testing devices, or vehicles without scheduling overlaps.</p>
        </div>
        <button
          onClick={() => {
            setBookingForm((prev) => ({ ...prev, assetId: selectedResourceId }));
            setShowFormModal(true);
          }}
          className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Booking</span>
        </button>
      </div>

      {/* Grid: Left = Shared Resources selector, Right = Agenda/Calendar view */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Shared resources select cards (1/3 width) */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-800 text-sm">Select shared Resource</h3>
          <div className="space-y-3">
            {bookableResources.map((res) => {
              const isSelected = res.id === selectedResourceId;
              const nextBookings = bookings.filter((b) => b.assetId === res.id && b.status === "Upcoming").length;
              return (
                <button
                  key={res.id}
                  onClick={() => setSelectedResourceId(res.id)}
                  className={`w-full p-4 border rounded-2xl text-left transition-all ${
                    isSelected
                      ? "border-blue-600 bg-blue-50/20 ring-1 ring-blue-600"
                      : "border-slate-200 bg-white hover:border-slate-350"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-slate-800 text-xs">{res.name}</h4>
                    <span className="font-mono text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase">{res.id}</span>
                  </div>
                  <div className="space-y-1.5 mt-3 text-[10px] text-slate-450">
                    <p className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{res.location}</span>
                    </p>
                    <p className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      <span>Capacity: {res.customData["Capacity"] || "N/A"}</span>
                    </p>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-between items-center text-[9px]">
                    <span className="font-semibold text-slate-450">{nextBookings} upcoming bookings</span>
                    <span className={`px-1.5 py-0.5 rounded-full font-bold ${
                      res.status === "Available" ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"
                    }`}>{res.status}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Calendar / Agenda view (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between min-h-[450px]">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-800 text-sm">
                    Agenda: {activeResource?.name || "No Resource Selected"}
                  </h3>
                </div>
                <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold uppercase">
                  {selectedResourceId}
                </span>
              </div>

              {/* Booking Agenda list */}
              {resourceBookings.length === 0 ? (
                <div className="py-16 text-center text-slate-400 space-y-2">
                  <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs">No active bookings scheduled for this resource.</p>
                  <p className="text-[10px] text-slate-450">Use the "New Booking" button to schedule a slot.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {resourceBookings.map((b) => {
                    const startVal = new Date(b.startTime);
                    const endVal = new Date(b.endTime);
                    const isCancelled = b.status === "Cancelled";

                    return (
                      <div
                        key={b.id}
                        className={`p-4 border rounded-xl flex items-center justify-between text-left transition-all ${
                          isCancelled
                            ? "bg-slate-50/50 border-slate-200/60 opacity-60"
                            : "bg-slate-50/20 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 text-xs">
                              {startVal.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                              {endVal.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold">•</span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              {startVal.toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate leading-4">
                            Reserved by <strong className="text-slate-700 font-bold">{getBookedByName(b.bookedById)}</strong>
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isCancelled
                                ? "bg-red-50 text-red-500"
                                : "bg-green-50 text-green-600"
                            }`}
                          >
                            {b.status}
                          </span>
                          {!isCancelled && (b.bookedById === currentUser.id || currentUser.role !== "Employee") && (
                            <button
                              onClick={() => cancelBooking(b.id)}
                              title="Cancel Reservation"
                              className="p-1 text-slate-400 hover:text-red-500 hover:bg-slate-100 rounded-md transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-8 p-3 bg-blue-50/30 text-[10px] text-slate-500 rounded-xl leading-4 flex gap-1.5 items-start">
              <HelpCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <span>Overlap rules enforce exclusive scheduling. An error will show if you try to book overlapping ranges for the same item.</span>
            </div>
          </div>
        </div>

      </div>

      {/* ---------------------------------------------------- */}
      {/* Booking Form Modal */}
      {/* ---------------------------------------------------- */}
      {showFormModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6">
            <h3 className="font-bold text-slate-800 text-sm mb-4">Book Shared Resource</h3>
            <form onSubmit={handleBookingSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-xs text-rose-650 rounded-lg font-semibold flex items-start gap-1.5">
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}
              {formSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 text-xs text-green-600 rounded-lg font-semibold flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Select Resource</label>
                <select
                  value={bookingForm.assetId}
                  onChange={(e) => setBookingForm({ ...bookingForm, assetId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
                >
                  {bookableResources.map((res) => (
                    <option key={res.id} value={res.id}>{res.name} ({res.id})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    value={bookingForm.startTime}
                    onChange={(e) => setBookingForm({ ...bookingForm, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">End Date & Time</label>
                  <input
                    type="datetime-local"
                    value={bookingForm.endTime}
                    onChange={(e) => setBookingForm({ ...bookingForm, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
                >
                  Schedule Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
