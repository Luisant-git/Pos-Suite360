import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, ArrowRight } from 'lucide-react';
import api from '../../api';

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await api.post('/auth/login', { username, password });
      if (response.data && response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-md shadow-lg overflow-hidden border border-[#E2E8F0]">
      <div className="bg-[#0F172A] p-8 text-center relative overflow-hidden border-b border-[#1E293B]">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
        <h1 className="text-3xl font-black text-white relative z-10 tracking-wide">POS SUITE <span className="text-[#3B82F6]">360</span></h1>
        <p className="text-[#94A3B8] mt-2 relative z-10 text-[13px] font-bold">Sign in to manage your workspace</p>
      </div>
      
      <div className="p-8 bg-white">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded text-[13px] font-medium text-center">
            {error}
          </div>
        )}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-[13px] font-bold text-[#334155] mb-2 uppercase tracking-wide">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8]">
                <User size={16} />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-[#E2E8F0] rounded focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] transition-colors bg-[#F8FAFC] focus:bg-white text-[13px] font-medium outline-none text-[#0F172A]"
                placeholder="Enter your username"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-[13px] font-bold text-[#334155] mb-2 uppercase tracking-wide">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8]">
                <Lock size={16} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-[#E2E8F0] rounded focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] transition-colors bg-[#F8FAFC] focus:bg-white text-[13px] font-medium outline-none text-[#0F172A]"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded shadow-sm text-[13px] font-bold text-white bg-[#10B981] hover:bg-[#059669] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#10B981] transition-all disabled:opacity-70 mt-4 uppercase tracking-wide"
          >
            {isLoading ? 'Authenticating...' : 'Secure Login'}
            {!isLoading && <ArrowRight size={16} />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
