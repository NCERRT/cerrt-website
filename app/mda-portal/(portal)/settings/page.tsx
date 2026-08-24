"use client";

import { useState, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Building02Icon,
  CheckmarkCircle02Icon,
  LockKeyIcon,
  Settings02Icon,
  UserIcon,
  ViewIcon,
  ViewOffIcon,
  Alert02Icon,
  Mail01Icon,
} from "@hugeicons/core-free-icons";

import {
  changeMdaPasswordAction,
  getMdaSessionAction,
  updateMdaProfileAction,
} from "@/app/actions/mdaAuth";
import type { AuthenticatedMdaUser } from "@/lib/server/mdaAuth";

export default function MdaSettingsPage() {
  const [user, setUser] = useState<AuthenticatedMdaUser | null>(null);

  // Profile form state
  const [profileData, setProfileData] = useState({
    contactName: "",
    jobTitle: "",
    phone: "",
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    getMdaSessionAction().then((session) => {
      if (session) {
        setUser(session);
        setProfileData({
          contactName: session.contactName,
          jobTitle: session.jobTitle || "",
          phone: session.phone || "",
        });
      }
    });
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    setSavingProfile(true);

    try {
      const res = await updateMdaProfileAction(profileData);
      if (res.success) {
        setProfileSuccess("Profile details updated successfully.");
      } else {
        setProfileError(res.error);
      }
    } catch {
      setProfileError("Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setChangingPassword(true);

    try {
      const res = await changeMdaPasswordAction({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (res.success) {
        setPasswordSuccess("Password changed successfully.");
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setPasswordError(res.error);
      }
    } catch {
      setPasswordError("Failed to change password.");
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
          <HugeiconsIcon icon={Settings02Icon} size={24} className="text-primary" />
          MDA Account Settings
        </h1>
        <p className="text-xs text-gray-600 mt-1">
          Manage officer credentials, update designated contact info, and change your password.
        </p>
      </div>

      {/* Organization Info Card (Read-only) */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
          <HugeiconsIcon icon={Building02Icon} size={18} className="text-primary" />
          Agency Organization Context
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-gray-500 block mb-1">Organization Name:</span>
            <span className="text-gray-900 font-bold text-sm">{user?.organizationName}</span>
          </div>

          <div>
            <span className="text-gray-500 block mb-1">Acronym / Sector:</span>
            <div className="flex items-center space-x-2">
              {user?.acronym && (
                <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-mono font-bold text-xs border border-primary/20">
                  {user.acronym}
                </span>
              )}
              <span className="text-gray-700 font-semibold">{user?.sector || "Public Sector"}</span>
            </div>
          </div>

          <div>
            <span className="text-gray-500 block mb-1">Verified Domain:</span>
            <span className="font-mono text-gray-900 font-bold bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200 inline-block">
              @{user?.verifiedDomains[0] || "gov.ng"}
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Profile Form + Password Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Contact Officer Profile Details */}
        <form onSubmit={handleProfileSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-5">
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <HugeiconsIcon icon={UserIcon} size={18} className="text-primary" />
            Contact Officer Info
          </h2>

          {profileError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-xs flex items-center gap-2">
              <HugeiconsIcon icon={Alert02Icon} size={16} />
              <span>{profileError}</span>
            </div>
          )}

          {profileSuccess && (
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 text-primary text-xs flex items-center gap-2 font-medium">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} />
              <span>{profileSuccess}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Official Email Address (Locked)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <HugeiconsIcon icon={Mail01Icon} size={16} />
              </div>
              <input
                type="email"
                disabled
                value={user?.email || ""}
                className="w-full bg-gray-100 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-gray-500 font-medium cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Full Contact Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={profileData.contactName}
              onChange={(e) => setProfileData((prev) => ({ ...prev, contactName: e.target.value }))}
              className="w-full bg-gray-50/50 border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Job Title / Role <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={profileData.jobTitle}
              onChange={(e) => setProfileData((prev) => ({ ...prev, jobTitle: e.target.value }))}
              className="w-full bg-gray-50/50 border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Direct Phone Number
            </label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => setProfileData((prev) => ({ ...prev, phone: e.target.value }))}
              className="w-full bg-gray-50/50 border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-xs"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="w-full flex justify-center items-center py-2.5 px-4 rounded-xl text-xs font-bold bg-primary hover:bg-primary-light text-primary-foreground transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {savingProfile ? "Saving Profile..." : "Save Profile Details"}
            </button>
          </div>
        </form>

        {/* Right: Security & Password Change */}
        <form onSubmit={handlePasswordSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-5">
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <HugeiconsIcon icon={LockKeyIcon} size={18} className="text-primary" />
            Security & Password
          </h2>

          {passwordError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-xs flex items-center gap-2">
              <HugeiconsIcon icon={Alert02Icon} size={16} />
              <span>{passwordError}</span>
            </div>
          )}

          {passwordSuccess && (
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 text-primary text-xs flex items-center gap-2 font-medium">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} />
              <span>{passwordSuccess}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Current Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                className="w-full bg-gray-50/50 border border-gray-300 rounded-xl pl-4 pr-10 py-2.5 text-xs text-gray-900 focus:bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-xs"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <HugeiconsIcon icon={showCurrentPassword ? ViewOffIcon : ViewIcon} size={16} />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                className="w-full bg-gray-50/50 border border-gray-300 rounded-xl pl-4 pr-10 py-2.5 text-xs text-gray-900 focus:bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-xs"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <HugeiconsIcon icon={showNewPassword ? ViewOffIcon : ViewIcon} size={16} />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Confirm New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full bg-gray-50/50 border border-gray-300 rounded-xl pl-4 pr-10 py-2.5 text-xs text-gray-900 focus:bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-xs"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <HugeiconsIcon icon={showConfirmPassword ? ViewOffIcon : ViewIcon} size={16} />
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={changingPassword}
              className="w-full flex justify-center items-center py-2.5 px-4 rounded-xl text-xs font-bold bg-primary hover:bg-primary-light text-primary-foreground transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {changingPassword ? "Updating Password..." : "Update Account Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
