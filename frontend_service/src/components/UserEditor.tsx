"use client";
import { useEffect, useState } from "react";
import { Select, MenuItem, TextField } from "@mui/material";

export default function UserEditor({
  onRoleChange,
  selectedRole,
}: {
  onRoleChange: (role: string, dentistId?: string) => void;
  selectedRole: string;
}) {
  const [role, setRole] = useState<string>(selectedRole || "");
  const [dentistId, setDentistId] = useState<string>("");

  useEffect(() => {
    if (selectedRole) {
      setRole(selectedRole);
    }
  }, [selectedRole]);

  // Sync change upward whenever dentistId changes and role is 'dentist'
  useEffect(() => {
    if (role === "dentist") {
      onRoleChange(role, dentistId);
    }
  }, [dentistId]);

  return (
    <div className="bg-slate-100 rounded-lg space-x-5 space-y-4 w-fit px-10 py-5 justify-center">
      <div>
        <p>Change Role</p>
        <Select
          variant="standard"
          name="role"
          id="role"
          value={role}
          onChange={(e) => {
            const selected = e.target.value;
            setRole(selected);
            setDentistId(""); // reset if switching roles
            onRoleChange(selected); // pass only role at first
          }}
          className="h-[2em] w-[200px]"
        >
          <MenuItem value="user">User</MenuItem>
          <MenuItem value="admin">Admin</MenuItem>
          <MenuItem value="banned">Banned</MenuItem>
          <MenuItem value="dentist">Dentist</MenuItem>
        </Select>
      </div>

      {role === "dentist" && (
        <div>
          <p>Dentist ID</p>
          <TextField
            variant="standard"
            name="dentist_id"
            id="dentist_id"
            value={dentistId}
            onChange={(e) => setDentistId(e.target.value)}
            className="w-[200px]"
          />
        </div>
      )}
    </div>
  );
}
