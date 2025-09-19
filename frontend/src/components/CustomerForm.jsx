import { useState, useEffect } from "react";
import { addCustomer, getAllUsers } from "../api";

export default function CustomerForm({ onAdd, role }) {
  const [name, setName] = useState("");
  const [clothesCount, setClothesCount] = useState(1);
  const [ownerUsername, setOwnerUsername] = useState("");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (role === "serviceman") {
      getAllUsers().then(setUsers).catch(console.error);
    }
  }, [role]);

  if (role !== "serviceman") return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || clothesCount <= 0) return;
    try {
      await addCustomer({
        name,
        clothes_count: clothesCount,
        owner_username: ownerUsername, // ✅ attach owner
      });
      setName("");
      setClothesCount(1);
      setOwnerUsername("");
      onAdd();
    } catch (err) {
      console.error("Failed to add customer:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
      <input
        type="text"
        placeholder="Customer Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="number"
        min="1"
        placeholder="No. of clothes"
        value={clothesCount}
        onChange={(e) => setClothesCount(parseInt(e.target.value))}
        required
      />

      {/* ✅ Customer Selection Dropdown */}
      <select
        value={ownerUsername}
        onChange={(e) => setOwnerUsername(e.target.value)}
        required
      >
        <option value="">-- Select Customer --</option>
        {users
          .filter((u) => u.role === "customer")
          .map((u) => (
            <option key={u.id} value={u.username}>
              {u.username}
            </option>
          ))}
      </select>

      <button type="submit">Add Customer</button>
    </form>
  );
}
