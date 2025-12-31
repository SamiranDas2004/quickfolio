"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<"signup" | "upload">("signup");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    name: "",
  });

  useEffect(() => {
    const username = searchParams.get("username");
    if (username) {
      setFormData((prev) => ({ ...prev, username }));
    }
  }, [searchParams]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [extractedData, setExtractedData] = useState<any>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:8000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("username", formData.username);
        toast.success("Account created successfully!");
        setStep("upload");
      } else {
        const data = await response.json();
        const errorMsg = typeof data.detail === 'string' ? data.detail : 'Signup failed';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      setError("Network error. Please try again.");
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === "application/pdf" || 
          selectedFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        setFile(selectedFile);
        setError("");
      } else {
        setError("Please upload a PDF or DOCX file");
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setError("");

    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    try {
      const token = localStorage.getItem("token");
      const username = formData.username;
      
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 300);

      const response = await fetch(`http://localhost:8000/api/upload-resume/${username}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataUpload,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (response.ok) {
        const data = await response.json();
        setExtractedData(data.extracted_data || { name: formData.name });
        toast.success("Resume processed successfully!");
      } else {
        const data = await response.json();
        setError(data.detail || "Upload failed");
        toast.error(data.detail || "Upload failed");
      }
    } catch (err) {
      setError("Upload failed. Please try again.");
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSkip = () => {
    alert("Redirecting to portfolio...");
  };

  if (step === "upload") {
    return (
      <div className="min-h-screen bg-zinc-900 flex">
        {/* Left Panel - Upload Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                  <span className="text-xl">📊</span>
                </div>
                <span className="text-white text-2xl font-bold">Quickfolio</span>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-white text-3xl font-bold mb-2">Upload Your Resume</h2>
              <p className="text-zinc-400">Let AI extract your information (PDF or DOCX)</p>
            </div>

            {!uploading && !extractedData && (
              <div className="space-y-6">
                <div className="border-2 border-dashed border-zinc-700 rounded-2xl p-12 text-center hover:border-blue-500 transition-colors bg-zinc-800/50">
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                    id="resume-upload"
                  />
                  <label htmlFor="resume-upload" className="cursor-pointer">
                    <div className="text-6xl mb-4">📄</div>
                    <p className="text-white font-medium mb-2">
                      {file ? file.name : "Click to upload resume"}
                    </p>
                    <p className="text-zinc-400 text-sm">PDF or DOCX (Max 10MB)</p>
                  </label>
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}

                <div className="flex gap-4">
                  <button
                    onClick={handleUpload}
                    disabled={!file}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    Upload & Process
                  </button>
                  <button
                    onClick={handleSkip}
                    className="px-6 py-3 bg-zinc-800 border border-zinc-700 text-white rounded-xl hover:bg-zinc-700 transition-colors"
                  >
                    Skip
                  </button>
                </div>
              </div>
            )}

            {uploading && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-6xl mb-4 animate-pulse">🤖</div>
                  <p className="text-white font-medium mb-2">Processing your resume...</p>
                  <p className="text-zinc-400 text-sm">AI is extracting your information</p>
                </div>

                <div className="space-y-2">
                  <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-zinc-400 text-sm text-center">{progress}%</p>
                </div>
              </div>
            )}

            {extractedData && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-6xl mb-4">✅</div>
                  <p className="text-white font-medium mb-2">Resume processed successfully!</p>
                  <p className="text-zinc-400 text-sm mb-6">Your portfolio is ready</p>
                </div>

                <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6 space-y-4">
                  <div>
                    <p className="text-zinc-400 text-sm mb-2">Your Portfolio URL:</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={`http://localhost:3000/${formData.username}`}
                        readOnly
                        className="flex-1 px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white text-sm"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`http://localhost:3000/${formData.username}`);
                          toast.success("URL copied!");
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                      >
                        Copy
                      </button>
                      <button
                        onClick={() => window.open(`http://localhost:3000/${formData.username}`, "_blank")}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium"
                      >
                        Open
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Logo */}
        <div className="hidden lg:flex lg:w-1/2 bg-black items-center justify-center p-12">
          <div className="text-center max-w-2xl">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-3xl mb-8">
              <div className="text-4xl">📊</div>
            </div>
            <h1 className="text-white text-7xl font-bold mb-8">Quickfolio</h1>
            
            <div className="relative max-w-xl mx-auto mb-6">
              <input
                type="text"
                placeholder="Ask me anything..."
                className="w-full px-6 py-4 bg-zinc-800 border border-zinc-700 rounded-2xl text-white placeholder-zinc-500 pr-14 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-700 transition-colors">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
            
            <p className="text-zinc-400 text-xl">
              Conversational portfolio that answers questions about you 24/7
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 flex">
      {/* Left Panel - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                <span className="text-xl">📊</span>
              </div>
              <span className="text-white text-2xl font-bold">Quickfolio</span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-white text-3xl font-bold mb-2">Login to your account</h2>
            <p className="text-zinc-400">Enter your email below to login to your account</p>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            <button className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-black rounded-xl hover:bg-zinc-100 transition-colors font-medium">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
            <button className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-zinc-800 border border-zinc-700 text-white rounded-xl hover:bg-zinc-700 transition-colors font-medium">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Continue with GitHub
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-zinc-900 text-zinc-400">Or continue with</span>
            </div>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
          <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="John Doe"
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                required
              />
            </div>
          <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({...formData,  username: e.target.value})}
                placeholder="johndoe"
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="m@example.com"
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-zinc-300">Password</label>
                <a href="#" className="text-sm text-zinc-400 hover:text-zinc-300">Forgot your password?</a>
              </div>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}


            <button 
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-black rounded-xl hover:bg-zinc-100 transition-colors font-medium">
              {loading ? "Creating ..." : "Create Portfolio"}
            </button>
          </form>
        </div>
      </div>

      {/* Right Panel - Product Showcase */}
      <div className="hidden lg:flex lg:w-1/2 bg-black items-center justify-center p-12">
        <div className="text-center max-w-2xl">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-3xl mb-8">
          
          </div>
          <h1 className="text-white text-9xl font-bold mb-8">Quickfolio</h1>
          
          <div className="relative max-w-xl mx-auto mb-6">
            <input
              type="text"
              placeholder="Ask me anything..."
              className="w-full px-6 py-4 bg-zinc-800 border border-zinc-700 rounded-2xl text-white placeholder-zinc-500 pr-14 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-700 transition-colors">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
          
          <p className="text-zinc-400 text-xl">
            Conversational portfolio that answers questions about you 24/7
          </p>
        </div>
      </div>
    </div>
  );
}