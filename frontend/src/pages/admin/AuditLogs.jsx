import { useEffect, useState } from "react";
import api from "../../services/api";
export default function AuditLogs() {
  const [d, setD] = useState([]);
  useEffect(() => {
    api.get("/admin/audit-logs").then((r) => setD(r.data.data));
  }, []);
  return (
    <>
      <h1>Audit Logs</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Admin</th>
            <th>Action</th>
            <th>Entity</th>
            <th>ID</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {d.map((x) => (
            <tr key={x._id}>
              <td>{x.admin_id?.name}</td>
              <td>{x.action_type}</td>
              <td>{x.entity_type}</td>
              <td>{x.entity_id}</td>
              <td>{new Date(x.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
