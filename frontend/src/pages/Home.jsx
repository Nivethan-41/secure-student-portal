import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="page-container">
      <h1>Secure Student Portal</h1>
      <p>Welcome to the secure portal. Please log in or register to continue.</p>
      <div className="actions">
        <Link to="/login" className="btn btn-primary">Login</Link>
        <Link to="/register" className="btn btn-secondary">Register</Link>
      </div>
    </div>
  );
};

export default Home;
