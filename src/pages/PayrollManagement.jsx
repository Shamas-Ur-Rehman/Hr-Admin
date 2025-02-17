import { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { Dialog } from "@headlessui/react";
import { XCircleIcon } from "lucide-react";
import axios from "axios";

axios.defaults.baseURL = "http://localhost:8080";
axios.defaults.withCredentials = true;

export default function PayrollManagement() {
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState({});
  const [branches, setBranches] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [formData, setFormData] = useState({
    employee_id: "",
    salary: "",
    month: "",
    tax: "",
    benefits: "",
    deductions: "",
    net_salary: "",
    branch_id: "",
  });
  const [editId, setEditId] = useState(null);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [payrollRes, employeeRes, branchRes] = await Promise.all([
        axios.get("/payroll"),
        axios.get("/employees"),
        axios.get("/branches/"),
      ]);

      setPayrolls(payrollRes.data || []);

      const employeeMap = {};
      employeeRes.data.forEach(emp => {
        employeeMap[emp.employee_id] = `${emp.first_name} ${emp.last_name}`;
      });
      setEmployees(employeeMap);

      const branchMap = {};
      branchRes.data.forEach(branch => {
        branchMap[branch.branch_id] = branch.branch_name;
      });
      setBranches(branchMap);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        employee_id: Number(formData.employee_id),
        salary: parseFloat(formData.salary),
        month: formData.month,
        tax: parseFloat(formData.tax),
        benefits: parseFloat(formData.benefits),
        deductions: parseFloat(formData.deductions),
        net_salary: parseFloat(formData.net_salary),
        branch_id: Number(formData.branch_id),
      };

      if (editId) {
        await axios.put(`/payroll/${editId}`, payload);
      } else {
        await axios.post("/payroll", payload);
      }

      fetchData();
      setIsOpen(false);
    } catch (err) {
      console.error("Error submitting payroll:", err);
    }
  };

  const handleEdit = (payroll) => {
    setEditId(payroll.payroll_id);
    setFormData(payroll);
    setIsOpen(true);
  };

  const confirmDelete = (payroll) => {
    setSelectedPayroll(payroll);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/payroll/${selectedPayroll.payroll_id}`);
      fetchData();
      setConfirmOpen(false);
    } catch (err) {
      console.error("Error deleting payroll:", err);
    }
  };

  return (
    <div className="p-5 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-center mb-4">Payroll Management</h1>

      <button
        onClick={() => {
          setEditId(null);
          setFormData({
            employee_id: "",
            salary: "",
            month: "",
            tax: "",
            benefits: "",
            deductions: "",
            net_salary: "",
            branch_id: "",
          });
          setIsOpen(true);
        }}
        className="mb-4 flex items-center gap-2 px-5 py-2.5 
             bg-gradient-to-r from-[#ff7e5f] to-[#feb47b] 
             text-white font-semibold rounded-lg 
             shadow-md hover:shadow-lg 
             transition-all duration-300 transform hover:scale-105"
      >
        <FaPlus className="w-5 h-5" />
        Add Payroll
      </button>

      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="w-full border-collapse text-sm">
          {/* Table Header with Gradient */}
          <thead>
            <tr className="bg-gradient-to-r from-[#f14f3e] to-[#fab768] text-white text-left">
              <th className="p-3">Employee Name</th>
              <th className="p-3">Salary</th>
              <th className="p-3">Tax</th>
              <th className="p-3">Benefits</th>
              <th className="p-3">Deductions</th>
              <th className="p-3">Net Salary</th>
              <th className="p-3">Month</th>
              <th className="p-3">Branch</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-gray-200">
            {payrolls.map((payroll, index) => (
              <tr key={payroll.payroll_id}
                className={`text-gray-700 hover:bg-gray-100 transition ${index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  }`}>
                <td className="p-3">{employees[payroll.employee_id] || `Unknown (${payroll.employee_id})`}</td>
                <td className="p-3">{payroll.salary}</td>
                <td className="p-3">{payroll.tax}</td>
                <td className="p-3">{payroll.benefits}</td>
                <td className="p-3">{payroll.deductions}</td>
                <td className="p-3 font-semibold text-green-600">{payroll.net_salary}</td>
                <td className="p-3">{payroll.month}</td>
                <td className="p-3">{branches[payroll.branch_id] || `Unknown (${payroll.branch_id})`}</td>

                {/* Actions */}
                <td className="p-3 flex justify-center gap-3">
                  <button onClick={() => handleEdit(payroll)}
                    className="text-blue-500 hover:text-blue-700 p-2 rounded-md transition">
                    <FaEdit className="w-5 h-5" />
                  </button>
                  <button onClick={() => confirmDelete(payroll)}
                    className="text-red-500 hover:text-red-700 p-2 rounded-md transition">
                    <FaTrash className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-3xl relative">

          {/* Close Button */}
          <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
            <XCircleIcon className="w-8 h-8 cursor-pointer" />
          </button>

          <h2 className="text-2xl font-semibold text-gray-800 text-center">{editId ? "Edit Payroll" : "Add Payroll"}</h2>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Form Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

              {/* Employee Dropdown */}
              <div className="flex flex-col">
                <label className="text-gray-700 font-medium">Employee</label>
                <select
                  name="employee_id"
                  value={formData.employee_id}
                  onChange={handleChange}
                  required
                  className="p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Employee</option>
                  {Object.entries(employees).map(([id, name]) => (
                    <option key={id} value={id}>{name}</option>
                  ))}
                </select>
              </div>

              {/* Salary */}
              <div className="flex flex-col">
                <label className="text-gray-700 font-medium">Salary</label>
                <input
                  type="number"
                  name="salary"
                  placeholder="Salary"
                  value={formData.salary}
                  onChange={handleChange}
                  required
                  className="p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Tax */}
              <div className="flex flex-col">
                <label className="text-gray-700 font-medium">Tax</label>
                <input
                  type="number"
                  name="tax"
                  placeholder="Tax"
                  value={formData.tax}
                  onChange={handleChange}
                  required
                  className="p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Benefits */}
              <div className="flex flex-col">
                <label className="text-gray-700 font-medium">Benefits</label>
                <input
                  type="number"
                  name="benefits"
                  placeholder="Benefits"
                  value={formData.benefits}
                  onChange={handleChange}
                  required
                  className="p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Deductions */}
              <div className="flex flex-col">
                <label className="text-gray-700 font-medium">Deductions</label>
                <input
                  type="number"
                  name="deductions"
                  placeholder="Deductions"
                  value={formData.deductions}
                  onChange={handleChange}
                  required
                  className="p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Month Dropdown */}
              <div className="flex flex-col">
                <label className="text-gray-700 font-medium">Month</label>
                <select
                  name="month"
                  value={formData.month}
                  onChange={handleChange}
                  required
                  className="p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Month</option>
                  {months.map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>

              {/* Branch Dropdown */}
              <div className="flex flex-col">
                <label className="text-gray-700 font-medium">Branch</label>
                <select
                  name="branch_id"
                  value={formData.branch_id}
                  onChange={handleChange}
                  required
                  className="p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Branch</option>
                  {Object.entries(branches).map(([id, name]) => (
                    <option key={id} value={id}>{name}</option>
                  ))}
                </select>
              </div>

            </div> {/* End of Grid */}

            {/* Buttons */}
            <div className="flex flex-wrap justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-6 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-md transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </Dialog>


      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-4 rounded shadow-lg">
          <p>Are you sure you want to delete this payroll?</p>
          <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded">Yes, Delete</button>
        </div>
      </Dialog>
    </div>
  );
}
