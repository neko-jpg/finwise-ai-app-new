
'use client';

import Link from 'next/link';
import { useAuthState } from "@/hooks/use-auth-state";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader } from "lucide-react";

export default function LandingPage() {
  const { user, loading } = useAuthState();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/app');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background dark">
        <div className="flex flex-col items-center gap-4">
          <Loader className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    );
  }
  
  if (user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background dark">
          <div className="flex flex-col items-center gap-4">
              <Loader className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">リダイレクト中...</p>
          </div>
      </div>
    );
  }

  // Render the marketing page if no user is logged in
  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#12211e] dark group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#25463f] px-10 py-3">
          <div className="flex items-center gap-4 text-white">
            <div className="size-4">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z"
                  fill="currentColor"
                ></path>
              </svg>
            </div>
            <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">FinAI</h2>
          </div>
          <div className="flex flex-1 justify-end gap-8">
            <div className="flex items-center gap-9">
              <a className="text-white text-sm font-medium leading-normal" href="#features">Features</a>
              <a className="text-white text-sm font-medium leading-normal" href="#demo">Demo</a>
              <a className="text-white text-sm font-medium leading-normal" href="#pricing">Pricing</a>
            </div>
            <div className="flex gap-2">
              <Link href="/entry" passHref>
                <button
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#1dc9a7] text-[#12211e] text-sm font-bold leading-normal tracking-[0.015em]"
                >
                  <span className="truncate">Get Started Free</span>
                </button>
              </Link>
              <a href="#demo"
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#25463f] text-white text-sm font-bold leading-normal tracking-[0.015em]"
              >
                <span className="truncate">Watch Demo</span>
              </a>
            </div>
          </div>
        </header>
        <div className="px-4 sm:px-10 md:px-20 lg:px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="@container">
              <div className="@[480px]:p-4">
                <div
                  className="flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat @[480px]:gap-8 @[480px]:rounded-xl items-center justify-center p-4"
                  style={{backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%), url("https://images.unsplash.com/photo-1554224155-8d04421cd6e2?q=80&w=2940&auto=format&fit=crop")'}}
                  data-ai-hint="finance planning"
                >
                  <div className="flex flex-col gap-2 text-center">
                    <h1
                      className="text-white text-4xl font-black leading-tight tracking-[-0.033em] @[480px]:text-5xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em]"
                       style={{ textShadow: '0 4px 20px rgba(0,0,0,0.4)' }}
                    >
                      Unlock Financial Clarity with AI
                    </h1>
                    <h2 className="text-white/80 text-lg font-normal leading-normal @[480px]:text-base @[480px]:font-normal @[480px]:leading-normal">
                      Experience the future of personal finance with our AI-powered app. Effortlessly manage your money, gain insights, and achieve your financial goals.
                    </h2>
                  </div>
                  <div className="flex-wrap gap-3 flex justify-center">
                     <Link href="/entry" passHref>
                        <button
                          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 @[480px]:h-12 @[480px]:px-5 bg-[#1dc9a7] text-[#12211e] text-sm font-bold leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-[0.015em]"
                        >
                          <span className="truncate">Get Started Free</span>
                        </button>
                    </Link>
                    <a href="#demo"
                      className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 @[480px]:h-12 @[480px]:px-5 bg-[#25463f] text-white text-sm font-bold leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-[0.015em]"
                    >
                      <span className="truncate">Watch Demo</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div id="features" className="flex scroll-mt-20 flex-col gap-10 px-4 py-10 @container">
              <div className="flex flex-col gap-4 text-center">
                <h1
                  className="text-white tracking-tight text-3xl font-bold leading-tight sm:text-4xl"
                >
                  Smart Features for Smarter Finances
                </h1>
                <p className="text-[#95c6bc] text-lg leading-normal max-w-3xl mx-auto">
                  Our AI-driven tools simplify money management, providing personalized insights and control over your financial life.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex flex-1 gap-3 rounded-lg border border-[#36635a] bg-[#1b322d] p-4 flex-col">
                  <div className="text-[#1dc9a7]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                      <path
                        d="M128,176a48.05,48.05,0,0,0,48-48V64a48,48,0,0,0-96,0v64A48.05,48.05,0,0,0,128,176ZM96,64a32,32,0,0,1,64,0v64a32,32,0,0,1-64,0Zm40,143.6V232a8,8,0,0,1-16,0V207.6A80.11,80.11,0,0,1,48,128a8,8,0,0,1,16,0,64,64,0,0,0,128,0,8,8,0,0,1,16,0A80.11,80.11,0,0,1,136,207.6Z"
                      ></path>
                    </svg>
                  </div>
                  <div className="flex flex-col gap-1">
                    <h2 className="text-white text-base font-bold leading-tight">Voice-Activated Transactions</h2>
                    <p className="text-[#95c6bc] text-sm font-normal leading-normal">Record transactions with simple voice commands, making expense tracking effortless.</p>
                  </div>
                </div>
                <div className="flex flex-1 gap-3 rounded-lg border border-[#36635a] bg-[#1b322d] p-4 flex-col">
                  <div className="text-[#1dc9a7]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                      <path
                        d="M72,104a8,8,0,0,1,8-8h96a8,8,0,0,1,0,16H80A8,8,0,0,1,72,104Zm8,40h96a8,8,0,0,0,0-16H80a8,8,0,0,0,0,16ZM232,56V208a8,8,0,0,1-11.58,7.15L192,200.94l-28.42,14.21a8,8,0,0,1-7.16,0L128,200.94,99.58,215.15a8,8,0,0,1-7.16,0L64,200.94,35.58,215.15A8,8,0,0,1,24,208V56A16,16,0,0,1,40,40H216A16,16,0,0,1,232,56Zm-16,0H40V195.06l20.42-10.22a8,8,0,0,1,7.16,0L96,199.06l28.42-14.22a8,8,0,0,1,7.16,0L160,199.06l28.42-14.22a8,8,0,0,1,7.16,0L216,195.06Z"
                      ></path>
                    </svg>
                  </div>
                  <div className="flex flex-col gap-1">
                    <h2 className="text-white text-base font-bold leading-tight">Receipt Scanning &amp; Auto-Fill</h2>
                    <p className="text-[#95c6bc] text-sm font-normal leading-normal">Snap photos of receipts to automatically extract and categorize transaction details.</p>
                  </div>
                </div>
                <div className="flex flex-1 gap-3 rounded-lg border border-[#36635a] bg-[#1b322d] p-4 flex-col">
                  <div className="text-[#1dc9a7]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                      <path
                        d="M24,104H48v64H32a8,8,0,0,0,0,16H224a8,8,0,0,0,0-16H208V104h24a8,8,0,0,0,4.19-14.81l-104-64a8,8,0,0,0-8.38,0l-104,64A8,8,0,0,0,24,104Zm40,0H96v64H64Zm80,0v64H112V104Zm48,64H160V104h32ZM128,41.39,203.74,88H52.26ZM248,208a8,8,0,0,1-8,8H16a8,8,0,0,1,0-16H240A8,8,0,0,1,248,208Z"
                      ></path>
                    </svg>
                  </div>
                  <div className="flex flex-col gap-1">
                    <h2 className="text-white text-base font-bold leading-tight">Seamless Bank Integration</h2>
                    <p className="text-[#95c6bc] text-sm font-normal leading-normal">Connect your bank accounts for real-time balance updates and transaction history.</p>
                  </div>
                </div>
                <div className="flex flex-1 gap-3 rounded-lg border border-[#36635a] bg-[#1b322d] p-4 flex-col">
                  <div className="text-[#1dc9a7]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                      <path
                        d="M232,208a8,8,0,0,1-8,8H32a8,8,0,0,1-8-8V48a8,8,0,0,1,16,0v94.37L90.73,98a8,8,0,0,1,10.07-.38l58.81,44.11L218.73,90a8,8,0,1,1,10.54,12l-64,56a8,8,0,0,1-10.07.38L96.39,114.29,40,163.63V200H224A8,8,0,0,1,232,208Z"
                      ></path>
                    </svg>
                  </div>
                  <div className="flex flex-col gap-1">
                    <h2 className="text-white text-base font-bold leading-tight">AI-Powered Budgeting</h2>
                    <p className="text-[#95c6bc] text-sm font-normal leading-normal">Let AI create and optimize your budget based on your spending patterns and goals.</p>
                  </div>
                </div>
                <div className="flex flex-1 gap-3 rounded-lg border border-[#36635a] bg-[#1b322d] p-4 flex-col">
                  <div className="text-[#1dc9a7]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                      <path
                        d="M176,232a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h80A8,8,0,0,1,176,232Zm40-128a87.55,87.55,0,0,1-33.64,69.21A16.24,16.24,0,0,0,176,186v6a16,16,0,0,1-16,16H96a16,16,0,0,1-16-16v-6a16,16,0,0,0-6.23-12.66A87.59,87.59,0,0,1,40,104.49C39.74,56.83,78.26,17.14,125.88,16A88,88,0,0,1,216,104Zm-16,0a72,72,0,0,0-73.74-72c-39,.92-70.47,33.39-70.26,72.39a71.65,71.65,0,0,0,27.64,56.3A32,32,0,0,1,96,186v6h64v-6a32.15,32.15,0,0,1,12.47-25.35A71.65,71.65,0,0,0,200,104Zm-16.11-9.34a57.6,57.6,0,0,0-46.56-46.55,8,8,0,0,0-2.66,15.78c16.57,2.79,30.63,16.85,33.44,33.45A8,8,0,0,0,176,104a9,9,0,0,0,1.35-.11A8,8,0,0,0,183.89,94.66Z"
                      ></path>
                    </svg>
                  </div>
                  <div className="flex flex-col gap-1">
                    <h2 className="text-white text-base font-bold leading-tight">Daily Financial Insights</h2>
                    <p className="text-[#95c6bc] text-sm font-normal leading-normal">Receive daily personalized tips and insights to improve your financial well-being.</p>
                  </div>
                </div>
              </div>
            </div>
            <div id="demo" className="scroll-mt-20 text-center py-10">
              <h2 className="text-white text-3xl sm:text-4xl font-bold leading-tight tracking-tight">See FinAI in Action</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4">
                <div className="flex flex-col gap-3">
                  <div
                    className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl"
                    style={{backgroundImage: 'url("https://images.unsplash.com/photo-1628191137358-76837a7a5a87?q=80&w=2874&auto=format&fit=crop")'}}
                    data-ai-hint="dashboard ui"
                  ></div>
                </div>
                <div className="flex flex-col gap-3">
                  <div
                    className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl"
                    style={{backgroundImage: 'url("https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=2874&auto=format&fit=crop")'}}
                    data-ai-hint="mobile ui"
                  ></div>
                </div>
                <div className="flex flex-col gap-3">
                  <div
                    className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl"
                    style={{backgroundImage: 'url("https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?q=80&w=2940&auto=format&fit=crop")'}}
                    data-ai-hint="analytics chart"
                  ></div>
                </div>
              </div>
            </div>
            <div id="pricing" className="scroll-mt-20 text-center py-10">
                <h2 className="text-white text-3xl sm:text-4xl font-bold leading-tight tracking-tight">Choose the Perfect Plan</h2>
                 <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#95c6bc]">
                    Choose the plan that’s right for you and start your journey towards smarter money management today.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 py-10">
                  <div className="flex flex-1 flex-col gap-4 rounded-xl border border-solid border-[#36635a] bg-[#1b322d] p-6">
                    <div className="flex flex-col gap-1">
                      <h1 className="text-white text-xl font-bold leading-tight">Free</h1>
                      <p className="flex items-baseline gap-1 text-white">
                        <span className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">$0</span>
                        <span className="text-white text-base font-bold leading-tight">/month</span>
                      </p>
                    </div>
                    <Link href="/entry?plan=free" className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#25463f] text-white text-sm font-bold leading-normal tracking-[0.015em]">
                      <span className="truncate">Get Started</span>
                    </Link>
                    <div className="flex flex-col gap-2 pt-3 border-t border-[#36635a]">
                      <div className="text-[13px] font-normal leading-normal flex gap-3 text-white">
                        <div className="text-[#1dc9a7]">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                            <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
                          </svg>
                        </div>
                        Basic budgeting
                      </div>
                      <div className="text-[13px] font-normal leading-normal flex gap-3 text-white">
                        <div className="text-[#1dc9a7]">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                            <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
                          </svg>
                        </div>
                        Manual transaction entry
                      </div>
                      <div className="text-[13px] font-normal leading-normal flex gap-3 text-white">
                        <div className="text-[#1dc9a7]">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                            <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
                          </svg>
                        </div>
                        Limited insights
                      </div>
                    </div>
                  </div>
                  <div className="relative flex flex-1 flex-col gap-4 rounded-xl border border-solid border-[#1dc9a7] bg-[#1b322d] p-6">
                     <p className="absolute -top-3 right-6 text-[#12211e] text-xs font-semibold leading-normal tracking-wide rounded-full bg-[#1dc9a7] px-3 py-1 text-center">Most Popular</p>
                    <div className="flex flex-col gap-1">
                      <h1 className="text-white text-xl font-bold leading-tight">Premium</h1>
                      <p className="flex items-baseline gap-1 text-white">
                        <span className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">$9.99</span>
                        <span className="text-white text-base font-bold leading-tight">/month</span>
                      </p>
                    </div>
                    <Link href="/entry?plan=premium" className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#1dc9a7] text-[#12211e] text-sm font-bold leading-normal tracking-[0.015em]">
                      <span className="truncate">Upgrade</span>
                    </Link>
                     <div className="flex flex-col gap-2 pt-3 border-t border-[#36635a]">
                      <div className="text-[13px] font-normal leading-normal flex gap-3 text-white">
                        <div className="text-[#1dc9a7]">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                            <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
                          </svg>
                        </div>
                        AI-powered budgeting
                      </div>
                      <div className="text-[13px] font-normal leading-normal flex gap-3 text-white">
                        <div className="text-[#1dc9a7]">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                            <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
                          </svg>
                        </div>
                        Automatic transaction import
                      </div>
                      <div className="text-[13px] font-normal leading-normal flex gap-3 text-white">
                        <div className="text-[#1dc9a7]">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                            <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
                          </svg>
                        </div>
                        Personalized insights
                      </div>
                       <div className="text-[13px] font-normal leading-normal flex gap-3 text-white">
                        <div className="text-[#1dc9a7]">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                            <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
                          </svg>
                        </div>
                        Priority support
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col gap-4 rounded-xl border border-solid border-[#36635a] bg-[#1b322d] p-6">
                    <div className="flex flex-col gap-1">
                      <h1 className="text-white text-xl font-bold leading-tight">Family</h1>
                      <p className="flex items-baseline gap-1 text-white">
                        <span className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">$14.99</span>
                        <span className="text-white text-base font-bold leading-tight">/month</span>
                      </p>
                    </div>
                    <Link href="/entry?plan=family" className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#25463f] text-white text-sm font-bold leading-normal tracking-[0.015em]">
                      <span className="truncate">Choose Family</span>
                    </Link>
                    <div className="flex flex-col gap-2 pt-3 border-t border-[#36635a]">
                      <div className="text-[13px] font-normal leading-normal flex gap-3 text-white">
                        <div className="text-[#1dc9a7]">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                            <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
                          </svg>
                        </div>
                        All Premium features
                      </div>
                      <div className="text-[13px] font-normal leading-normal flex gap-3 text-white">
                        <div className="text-[#1dc9a7]">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                            <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
                          </svg>
                        </div>
                        Up to 5 family members
                      </div>
                      <div className="text-[13px] font-normal leading-normal flex gap-3 text-white">
                        <div className="text-[#1dc9a7]">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                            <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
                          </svg>
                        </div>
                        Shared budgeting
                      </div>
                    </div>
                  </div>
                </div>
            </div>
            
            <footer className="flex flex-col gap-6 px-5 py-10 text-center @container">
              <div className="flex flex-wrap items-center justify-center gap-6 @[480px]:flex-row @[480px]:justify-around">
                <a className="text-[#95c6bc] text-base font-normal leading-normal min-w-40" href="#">Privacy Policy</a>
                <a className="text-[#95c6bc] text-base font-normal leading-normal min-w-40" href="#">Terms of Service</a>
                <a className="text-[#95c6bc] text-base font-normal leading-normal min-w-40" href="#">Contact Us</a>
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                <a href="#">
                  <div className="text-[#95c6bc]" data-icon="TwitterLogo" data-size="24px" data-weight="regular">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                      <path
                        d="M247.39,68.94A8,8,0,0,0,240,64H209.57A48.66,48.66,0,0,0,168.1,40a46.91,46.91,0,0,0-33.75,13.7A47.9,47.9,0,0,0,120,88v6.09C79.74,83.47,46.81,50.72,46.46,50.37a8,8,0,0,0-13.65,4.92c-4.31,47.79,9.57,79.77,22,98.18a110.93,110.93,0,0,0,21.88,24.2c-15.23,17.53-39.21,26.74-39.47,26.84a8,8,0,0,0-3.85,11.93c.75,1.12,3.75,5.05,11.08,8.72C53.51,229.7,65.48,232,80,232c70.67,0,129.72-54.42,135.75-124.44l29.91-29.9A8,8,0,0,0,247.39,68.94Zm-45,29.41a8,8,0,0,0-2.32,5.14C196,166.58,143.28,216,80,216c-10.56,0-18-1.4-23.22-3.08,11.51-6.25,27.56-17,37.88-32.48A8,8,0,0,0,92,169.08c-.47-.27-43.91-26.34-44-96,16,13,45.25,33.17,78.67,38.79A8,8,0,0,0,136,104V88a32,32,0,0,1,9.6-22.92A30.94,30.94,0,0,1,167.9,56c12.66.16,24.49,7.88,29.44,19.21A8,8,0,0,0,204.67,80h16Z"
                      ></path>
                    </svg>
                  </div>
                </a>
                <a href="#">
                  <div className="text-[#95c6bc]" data-icon="InstagramLogo" data-size="24px" data-weight="regular">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                      <path
                        d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160ZM176,24H80A56.06,56.06,0,0,0,24,80v96a56.06,56.06,0,0,0,56,56h96a56.06,56.06,0,0,0,56-56V80A56.06,56.06,0,0,0,176,24Zm40,152a40,40,0,0,1-40,40H80a40,40,0,0,1-40-40V80A40,40,0,0,1,80,40h96a40,40,0,0,1,40,40ZM192,76a12,12,0,1,1-12-12A12,12,0,0,1,192,76Z"
                      ></path>
                    </svg>
                  </div>
                </a>
                <a href="#">
                  <div className="text-[#95c6bc]" data-icon="FacebookLogo" data-size="24px" data-weight="regular">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                      <path
                        d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm8,191.63V152h24a8,8,0,0,0,0-16H136V112a16,16,0,0,1,16-16h16a8,8,0,0,0,0-16H152a32,32,0,0,0-32,32v24H96a8,8,0,0,0,0,16h24v63.63a88,88,0,1,1,16,0Z"
                      ></path>
                    </svg>
                  </div>
                </a>
              </div>
              <p className="text-[#95c6bc] text-base font-normal leading-normal">© 2024 FinAI. All rights reserved.</p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>
これまでのHTMLからSocialProofとSecurity & Trustセクションを削除し、FAQセクションを追加してください