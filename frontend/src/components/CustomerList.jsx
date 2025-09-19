import { useEffect, useState } from "react";
import { getCustomers, updateStatus } from "../api";

export default function CustomerList({ refreshFlag, role }) {
  const [customers, setCustomers] = useState([]);
  const [zoomQR, setZoomQR] = useState(null);

  const fetchCustomers = async () => {
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const updated = await updateStatus(id, status);
      setCustomers((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [refreshFlag]);

  if (customers.length === 0) return <p>No customers yet.</p>;

  return (
    <div>
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>SL No</th>
            <th>Name</th>
            <th>Date</th>
            <th>No. of Clothes</th>
            <th>Status</th>
            <th>Notification</th>
            <th>QR Code</th>
            {role === "serviceman" && <th>Update Status</th>}
          </tr>
        </thead>
        <tbody>
          {customers.map((c, idx) => (
            <tr key={c.id}>
              <td>{idx + 1}</td>
              <td>{c.name}</td>
              <td>{new Date(c.created_at).toLocaleDateString()}</td>
              <td>{c.clothes_count}</td>
              <td>{c.status}</td>
              <td>{c.notification || "-"}</td>
              <td>
                {c.qr_code_url && (
                  <img
                    src={`http://127.0.0.1:8000${c.qr_code_url}`}
                    width="50"
                    alt="QR Code"
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      setZoomQR(`http://127.0.0.1:8000${c.qr_code_url}`)
                    }
                  />
                )}
              </td>
              {role === "serviceman" && (
                <td>
                  <select
                    value={c.status}
                    onChange={(e) => handleStatusChange(c.id, e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="started">Started</option>
                    <option value="washed">Washed</option>
                    <option value="dried">Dried</option>
                    <option value="ready_for_pickup">Ready for Pickup</option>
                    <option value="picked_up">Picked Up</option>
                  </select>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* QR Code Zoom Modal */}
      {zoomQR && (
        <div
          onClick={() => setZoomQR(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <img
            src={zoomQR}
            alt="QR Zoom"
            style={{ width: "300px", height: "300px" }}
          />
        </div>
      )}
    </div>
  );
}
