import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";

const TestPage = () => {
  const { data: session } = useSession(); // Get session from next-auth
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const token = session?.accessToken || localStorage.getItem("jwt_token");

        if (!token) {
          setError("No token found");
          console.error("No token found");
          return;
        }

        // Fetch the patients using the token
        const res = await axios.get('http://localhost:3000/api/doctors/6d165e14-6b99-47e2-a8cf-1bf50e561c9b/patients', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.data.success) {
          setPatients(res.data.patients);  // Update patients list
        } else {
          setError("Failed to fetch patients");
        }
      } catch (error) {
        setLoading(false);
        console.error("Error fetching patients:", error);

        // Enhanced error handling
        if (error.response) {
          // The request was made and the server responded with a status code that falls out of the range of 2xx
          setError(`Server responded with status code: ${error.response.status}`);
        } else if (error.request) {
          // The request was made but no response was received
          setError("No response received from the server");
        } else {
          // Something happened in setting up the request that triggered an Error
          setError(`Error: ${error.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchPatients();
    } else {
      setError("Session not found");
      setLoading(false);  // Stop loading if no session
    }
  }, [session]);  // Run when session changes

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Patients List</h1>
      <ul>
        {patients.map((patient) => (
          <li key={patient.id}>
            {patient.name} - {patient.dob}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TestPage;
