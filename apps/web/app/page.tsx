'use client'
import React from 'react'
import {
  Activity,
  ArrowRight,
  Play,
  CheckCircle,
  Globe,
  Shield,
  Zap,
  BarChart3,
  Wifi,
  Cpu,
  MapPin,
  ChevronRight,
  Star,
  ExternalLink,
  Twitter,
  Linkedin,
  Github,
  Mail,
  Settings,
  Navigation,
  Signal,
  LogOut,
  LogIn,
} from 'lucide-react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../hooks/use-auth'
import { signOut } from '../lib/auth-client'

// --- VISUAL ASSETS & COMPONENTS ---

const GradientText = ({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) => (
  <span
    className={`bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 ${className}`}
  >
    {children}
  </span>
)

const DecorativeChart = () => {
  return (
    <div className="flex items-end gap-1 h-16 w-full px-2">
      {[40, 65, 50, 80, 55, 90, 70, 85, 60, 95, 75, 50, 40, 60, 80].map(
        (h, i) => (
          <motion.div
            key={i}
            initial={{ height: '20%' }}
            animate={{ height: `${h}%` }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: 'reverse',
              delay: i * 0.1,
              ease: 'easeInOut',
            }}
            className="flex-1 bg-gradient-to-t from-blue-600/80 to-indigo-400/80 rounded-t-sm opacity-80"
          />
        )
      )}
    </div>
  )
}

const MovingTicker = () => {
  const items = [
    'REAL-TIME LATENCY < 12MS',
    '•',
    '99.99% UPTIME SLA',
    '•',
    'END-TO-END ENCRYPTION',
    '•',
    'GLOBAL SATELLITE COVERAGE',
    '•',
    'AI PREDICTIVE MAINTENANCE',
    '•',
    'IOT SENSOR FUSION',
    '•',
    'MULTI-CLOUD ARCHITECTURE',
    '•',
  ]

  return (
    <div className="w-full bg-blue-950/30 border-y border-blue-900/30 overflow-hidden py-3 backdrop-blur-sm">
      <motion.div
        className="flex whitespace-nowrap gap-8 text-blue-300/80 text-xs font-bold tracking-[0.2em] uppercase"
        animate={{ x: [0, -1000] }}
        transition={{ repeat: Infinity, duration: 30, ease: 'linear' }}
      >
        {[...items, ...items, ...items, ...items].map((item, i) => (
          <span key={i}>{item}</span>
        ))}
      </motion.div>
    </div>
  )
}

// --- NAVBAR WITH AUTH ---

const Navbar = () => {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.refresh()
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Activity className="text-white" size={18} />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">
            TrackFlow
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">
            Features
          </a>
          <a href="#solutions" className="hover:text-white transition-colors">
            Solutions
          </a>
          <a href="#pricing" className="hover:text-white transition-colors">
            Pricing
          </a>
        </div>

        <div className="flex items-center gap-4">
          {!isLoading &&
            (isAuthenticated ? (
              <>
                <span className="hidden md:block text-slate-400 text-sm">
                  {user?.name}
                </span>
                <button
                  onClick={handleSignOut}
                  className="hidden md:flex items-center gap-2 text-slate-300 hover:text-white text-sm font-medium transition-colors"
                >
                  <LogOut size={16} />
                  Log Out
                </button>
                <Link
                  href="/dashboard"
                  className="bg-white text-slate-900 hover:bg-slate-200 px-5 py-2 rounded-full text-sm font-bold transition-all transform hover:scale-105 shadow-lg shadow-white/10"
                >
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden md:flex items-center gap-2 text-slate-300 hover:text-white text-sm font-medium transition-colors"
                >
                  <LogIn size={16} />
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="bg-white text-slate-900 hover:bg-slate-200 px-5 py-2 rounded-full text-sm font-bold transition-all transform hover:scale-105 shadow-lg shadow-white/10"
                >
                  Get Started
                </Link>
              </>
            ))}
        </div>
      </div>
    </nav>
  )
}

// rest of components unchanged...
const Hero = () => (
  <section className="relative pt-40 pb-20 px-6 overflow-hidden">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50 text-blue-300 text-xs font-medium"
        >
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
          Now live in 140+ countries
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-white"
        >
          Total Visibility <br />
          <GradientText>Zero Blindspots</GradientText>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg text-slate-400 max-w-xl leading-relaxed"
        >
          Orchestrate your global logistics with the world's most advanced
          tracking OS. Real-time telemetry, predictive insights, and automated
          compliance in one dashboard.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link
            href="/dashboard"
            className="group bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
          >
            Go to Dashboard
            <ArrowRight
              size={20}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
          <button className="group bg-slate-900/50 hover:bg-slate-800 border border-slate-700 text-white px-8 py-4 rounded-xl font-medium text-lg transition-all flex items-center justify-center gap-3 backdrop-blur-md">
            <Play
              size={18}
              className="fill-white group-hover:text-blue-400 transition-colors"
            />{' '}
            Watch Demo
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex items-center gap-6 pt-4"
        >
          <div className="flex -space-x-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center overflow-hidden"
              >
                <img
                  src={`https://i.pravatar.cc/100?img=${i + 10}`}
                  alt="user"
                  className="w-full h-full object-cover opacity-80"
                />
              </div>
            ))}
          </div>
          <div className="text-sm text-slate-400">
            Trusted by <span className="text-white font-semibold">4,000+</span>{' '}
            logistics teams
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, x: 20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl blur-2xl opacity-20 animate-pulse" />

        <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-2xl overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <div>
              <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                Live Fleet Status
              </div>
              <div className="text-2xl font-bold text-white flex items-center gap-2">
                1,248{' '}
                <span className="text-emerald-400 text-sm font-normal bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Active
                </span>
              </div>
            </div>
            <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400">
              <Settings size={20} />
            </div>
          </div>

          <div className="relative h-48 bg-slate-800/50 rounded-2xl border border-slate-700/50 mb-6 overflow-hidden">
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  'radial-gradient(#3b82f6 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            />
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)]"
                style={{ top: `${20 * i}%`, left: `${30 * i}%` }}
                animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0.4, 0.8] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
              />
            ))}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-lg flex items-center justify-center z-10">
                <Navigation className="text-white" size={16} />
              </div>
            </div>
            <div className="absolute bottom-3 left-3 bg-slate-900/90 px-3 py-1 rounded-lg text-[10px] font-mono text-slate-400 border border-slate-700">
              LAT: 23.7937 • LNG: 90.4066
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
              <div className="flex items-center gap-2 mb-2 text-slate-400 text-xs font-bold uppercase">
                <Zap size={12} className="text-amber-400" /> Battery Health
              </div>
              <div className="text-xl font-bold text-white">
                94%{' '}
                <span className="text-xs font-normal text-emerald-400">
                  +2%
                </span>
              </div>
              <div className="w-full bg-slate-700 h-1 mt-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 w-[94%] h-full" />
              </div>
            </div>
            <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50 relative overflow-hidden">
              <div className="flex items-center gap-2 mb-2 text-slate-400 text-xs font-bold uppercase relative z-10">
                <Signal size={12} className="text-blue-400" /> Network Speed
              </div>
              <div className="text-xl font-bold text-white relative z-10">
                52{' '}
                <span className="text-xs font-normal text-slate-500">mbps</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-8">
                <DecorativeChart />
              </div>
            </div>
          </div>
        </div>

        <motion.div
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -right-8 top-12 bg-slate-800/90 backdrop-blur-md p-4 rounded-xl border border-slate-600 shadow-xl w-48 z-20"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
              <CheckCircle size={16} />
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                Route Optimized
              </div>
              <div className="text-[10px] text-slate-400">
                Saved 45 mins • 12km
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  </section>
)

const FeatureCard = ({
  icon: Icon,
  title,
  desc,
  delay,
}: {
  icon: any
  title: string
  desc: string
  delay: number
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className="group p-8 rounded-3xl bg-slate-900/40 border border-slate-800 hover:bg-slate-800/40 hover:border-slate-700 transition-all cursor-default"
  >
    <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner shadow-white/5">
      <Icon size={28} className="text-blue-400 group-hover:text-blue-300" />
    </div>
    <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
    <p className="text-slate-400 leading-relaxed text-sm">{desc}</p>
  </motion.div>
)

const Features = () => (
  <section id="features" className="py-24 px-6 relative bg-slate-950">
    <div className="max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-20">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
          Built for mission-critical logistics
        </h2>
        <p className="text-slate-400 text-lg">
          Scalable infrastructure that adapts to your fleet size, from a single
          delivery drone to a global maritime network.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <FeatureCard
          icon={Globe}
          title="Global Coverage"
          desc="Seamless connectivity switching between cellular (4G/5G) and satellite networks ensures zero-dead-zone tracking anywhere on Earth."
          delay={0}
        />
        <FeatureCard
          icon={Cpu}
          title="Edge Computing"
          desc="Process telemetry data directly on the device for sub-millisecond alerts on collisions, geofence breaches, or temperature spikes."
          delay={0.1}
        />
        <FeatureCard
          icon={Shield}
          title="Military-Grade Security"
          desc="SOC 2 Type II compliant platform with end-to-end AES-256 encryption for all data in transit and at rest."
          delay={0.2}
        />
        <FeatureCard
          icon={BarChart3}
          title="Predictive Analytics"
          desc="AI models analyze historical route data to predict delays, optimize fuel consumption, and schedule preventative maintenance."
          delay={0.3}
        />
        <FeatureCard
          icon={Wifi}
          title="Offline Sync"
          desc="Devices store data locally when disconnected and auto-sync immediately upon reconnection, ensuring 100% data integrity."
          delay={0.4}
        />
        <FeatureCard
          icon={Settings}
          title="Remote Diagnostics"
          desc="Troubleshoot issues, update firmware, and configure sensor parameters over-the-air (OTA) without recalling vehicles."
          delay={0.5}
        />
      </div>
    </div>
  </section>
)

const Footer = () => (
  <footer className="bg-slate-900 pt-20 pb-10 border-t border-slate-800">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Activity className="text-white" size={20} />
            </div>
            <span className="font-bold text-xl text-white">TrackFlow</span>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            The operating system for modern logistics. Track, analyze, and
            optimize your moving assets with unprecedented precision.
          </p>
          <div className="flex gap-4">
            <a
              href="#"
              className="text-slate-400 hover:text-white transition-colors"
            >
              <Twitter size={20} />
            </a>
            <a
              href="#"
              className="text-slate-400 hover:text-white transition-colors"
            >
              <Linkedin size={20} />
            </a>
            <a
              href="#"
              className="text-slate-400 hover:text-white transition-colors"
            >
              <Github size={20} />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">Platform</h4>
          <ul className="space-y-4 text-sm text-slate-400">
            <li>
              <a href="#" className="hover:text-blue-400 transition-colors">
                Live Tracking
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-400 transition-colors">
                Fleet Management
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-400 transition-colors">
                Compliance
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-400 transition-colors">
                Maintenance
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">Company</h4>
          <ul className="space-y-4 text-sm text-slate-400">
            <li>
              <a href="#" className="hover:text-blue-400 transition-colors">
                About Us
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-400 transition-colors">
                Careers
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-400 transition-colors">
                Blog
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-400 transition-colors">
                Contact
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">Subscribe</h4>
          <p className="text-slate-400 text-sm mb-4">
            Latest updates on features and releases.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 w-full"
            />
            <button className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
        <p>&copy; 2024 TrackFlow Inc. All rights reserved.</p>
        <div className="flex gap-8">
          <a href="#" className="hover:text-white transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Terms of Service
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Cookie Settings
          </a>
        </div>
      </div>
    </div>
  </footer>
)

export default function App() {
  return (
    <div className="bg-slate-950 min-h-screen">
      <Navbar />
      <Hero />
      <MovingTicker />
      <Features />

      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/5"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
            Ready to modernize your fleet?
          </h2>
          <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto">
            Join thousands of companies using TrackFlow to save costs, improve
            safety, and deliver on time.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-white text-slate-900 hover:bg-slate-200 px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-xl">
              Start Free Trial
            </button>
            <button className="bg-slate-900 border border-slate-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all hover:bg-slate-800">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
