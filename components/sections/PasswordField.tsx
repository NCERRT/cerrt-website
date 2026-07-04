"use client";

import React, { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ViewIcon, ViewOffSlashIcon } from "@hugeicons/core-free-icons"; // or '@hugeicons-pro/core-stroke-rounded'

type PasswordFieldProps = React.InputHTMLAttributes<HTMLInputElement>;

export default function PasswordField({
  className,
  ...props
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative w-full">
      <input
        type={showPassword ? "text" : "password"}
        className={`w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-12 ${className}`}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="cursor-pointer absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 focus:outline-none"
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        <HugeiconsIcon
          icon={ViewIcon}
          altIcon={ViewOffSlashIcon}
          showAlt={showPassword}
          size={20}
        />
      </button>
    </div>
  );
}
