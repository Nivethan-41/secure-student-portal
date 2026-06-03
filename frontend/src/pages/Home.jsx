import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="page-container">
      <h1>Secure Student Portal</h1>
      <p>Welcome to the secure portal. Please log in or register to continue.</p>
      <div className="actions d-flex gap-3 mt-4">
        <Link to="/login" className="btn btn-primary hover-btn">Login</Link>
        <Link to="/register" className="btn btn-secondary hover-btn">Register</Link>
      </div>
    </div>
  );
};

export default Home;
