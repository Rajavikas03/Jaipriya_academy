import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { allOfferings } from '../data/offeringsData';
import { 
  Sparkles, 
  Mail, 
  Phone, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  Clock, 
  User, 
  Baby 
} from 'lucide-react';

export default function Contact() {
  const [searchParams] = useSearchParams();
  const programParam = searchParams.get('program') || '';

  const [formData, setFormData] = useState({
    parentName: '',
    email: '',
    phone: '',
    childName: '',
    interestedProgram: '',
    message: '',
  });

  const [errors, setErrors] = useState({});
  const [submittedMessage, setSubmittedMessage] = useState(null);

  useEffect(() => {
    if (programParam) {
      const match = allOfferings.find(
        (p) => p.id.toLowerCase() === programParam.toLowerCase()
      );
      if (match) {
        setFormData((prev) => ({ ...prev, interestedProgram: match.id }));
      }
    }
  }, [programParam]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.parentName.trim()) {
      newErrors.parentName = 'Please enter your name.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email format (e.g. name@example.com).';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Please enter your contact phone number.';
    } else if (!/^[0-9+\s()-]{7,15}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number.';
    }

    if (!formData.interestedProgram) {
      newErrors.interestedProgram = 'Please select a program of interest.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      // FRONTEND DEMO ONLY: Do not send to any server/API
      setSubmittedMessage({
        parentName: formData.parentName,
        program: allOfferings.find((p) => p.id === formData.interestedProgram)?.title || formData.interestedProgram,
      });

      // Reset form
      setFormData({
        parentName: '',
        email: '',
        phone: '',
        childName: '',
        interestedProgram: '',
        message: '',
      });
      setErrors({});

      // Scroll form feedback into view
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  };

  return (
    <div className="py-12 sm:py-16 md:py-20 bg-[#FBFBFA]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Hero */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-amber-50 text-amber-800 border border-amber-200/70 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Connect With Our Team
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold text-slate-900 tracking-tight">
            GET IN TOUCH
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 font-light leading-relaxed">
            Have questions about our programs, admissions, or batches? We warmly invite you to reach out.
          </p>
        </div>

        {/* Contact Information Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12 max-w-2xl mx-auto">
          
          {/* Phone Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-xl bg-amber-100/70 border border-amber-200 flex items-center justify-center text-amber-800 mb-4">
                <Phone className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Phone Inquiries
              </h3>
              <p className="text-xs text-slate-500 mb-3 font-light">
                Call or WhatsApp our team for admissions & batch schedules.
              </p>
            </div>
            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80">
              <a
                href="tel:+917358026150"
                className="text-base sm:text-lg font-bold text-amber-800 hover:text-amber-900 transition-colors font-mono block"
              >
                73580 26150
              </a>
            </div>
          </div>

          {/* Email Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-xl bg-blue-100/70 border border-blue-200 flex items-center justify-center text-blue-800 mb-4">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Email Admissions
              </h3>
              <p className="text-xs text-slate-500 mb-3 font-light">
                Send queries regarding curriculum, admissions & fees.
              </p>
            </div>
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/80">
              <a
                href="mailto:jaipriyaacademy@gmail.com"
                className="text-sm sm:text-base font-bold text-blue-800 hover:text-blue-900 transition-colors break-all block"
              >
                jaipriyaacademy@gmail.com
              </a>
            </div>
          </div>

        </div>

        {/* Demo Notification & Form Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Info Panel */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-card space-y-4">
              <h2 className="text-xl font-serif font-bold text-slate-900">
                Admissions & Counseling
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-light">
                Our counselors are happy to guide you in choosing the best program track based on your child's age, interests, and developmental milestones.
              </p>

              <div className="pt-2 border-t border-slate-100 space-y-3 text-xs text-slate-600">
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>
                    <strong>Hours:</strong> Mon–Sat, 9:00 AM – 6:00 PM
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Baby className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>Trial sessions available upon reservation.</span>
                </div>
              </div>
            </div>

            {/* Note on frontend status */}
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 text-xs flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Frontend Interface Notice</span>
                This form demonstrates the Batch 2 client-side validation experience. Live backend submission will be integrated in subsequent releases.
              </div>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="lg:col-span-8">
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 md:p-10 shadow-card">
              
              {/* Temporary Success Banner */}
              {submittedMessage && (
                <div className="mb-8 p-5 sm:p-6 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Inquiry Form Completed Successfully!</span>
                  </div>
                  <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
                    Thank you, <strong>{submittedMessage.parentName}</strong>, for your interest in <strong>{submittedMessage.program}</strong>.
                  </p>
                  <div className="p-3 bg-white/80 rounded-xl border border-emerald-200 text-xs text-emerald-800 font-mono">
                    ⚠️ <strong>Demo Notice:</strong> This is currently a frontend-only demonstration. No message was sent to a backend server. Full email and database connectivity will be connected in future batches.
                  </div>
                  <button
                    type="button"
                    onClick={() => setSubmittedMessage(null)}
                    className="mt-2 text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline"
                  >
                    Send another inquiry
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-6">
                
                {/* Row 1: Parent Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label 
                      htmlFor="parentName"
                      className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5"
                    >
                      Parent / Visitor Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="parentName"
                      name="parentName"
                      value={formData.parentName}
                      onChange={handleChange}
                      placeholder="e.g. Priya Sharma"
                      className={`w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border transition-all ${
                        errors.parentName 
                          ? 'border-rose-300 bg-rose-50/40 text-rose-900 focus:ring-rose-500' 
                          : 'border-slate-200 bg-slate-50/60 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200'
                      }`}
                    />
                    {errors.parentName && (
                      <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.parentName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label 
                      htmlFor="email"
                      className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5"
                    >
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. priya@example.com"
                      className={`w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border transition-all ${
                        errors.email 
                          ? 'border-rose-300 bg-rose-50/40 text-rose-900 focus:ring-rose-500' 
                          : 'border-slate-200 bg-slate-50/60 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200'
                      }`}
                    />
                    {errors.email && (
                      <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Row 2: Phone & Child Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label 
                      htmlFor="phone"
                      className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5"
                    >
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. +91 98765 43210"
                      className={`w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border transition-all ${
                        errors.phone 
                          ? 'border-rose-300 bg-rose-50/40 text-rose-900 focus:ring-rose-500' 
                          : 'border-slate-200 bg-slate-50/60 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200'
                      }`}
                    />
                    {errors.phone && (
                      <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label 
                      htmlFor="childName"
                      className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5"
                    >
                      Child's Name <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      id="childName"
                      name="childName"
                      value={formData.childName}
                      onChange={handleChange}
                      placeholder="e.g. Aarav"
                      className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                    />
                  </div>
                </div>

                {/* Row 3: Interested Program Select */}
                <div>
                  <label 
                    htmlFor="interestedProgram"
                    className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5"
                  >
                    Interested Program <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="interestedProgram"
                    name="interestedProgram"
                    value={formData.interestedProgram}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border bg-slate-50/60 transition-all ${
                      errors.interestedProgram 
                        ? 'border-rose-300 bg-rose-50/40 text-rose-900 focus:ring-rose-500' 
                        : 'border-slate-200 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-slate-800'
                    }`}
                  >
                    <option value="">-- Select an Academy Program --</option>
                    <optgroup label="Skill Development Courses">
                      {allOfferings
                        .filter((p) => p.categorySlug === 'skills')
                        .map((course) => (
                          <option key={course.id} value={course.id}>
                            {course.title} (Skill Development)
                          </option>
                        ))}
                    </optgroup>
                    <optgroup label="Early Childhood Education">
                      {allOfferings
                        .filter((p) => p.categorySlug === 'early-childhood')
                        .map((program) => (
                          <option key={program.id} value={program.id}>
                            {program.title} (Early Childhood)
                          </option>
                        ))}
                    </optgroup>
                  </select>
                  {errors.interestedProgram && (
                    <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.interestedProgram}
                    </p>
                  )}
                </div>

                {/* Row 4: Message (Optional) */}
                <div>
                  <label 
                    htmlFor="message"
                    className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5"
                  >
                    Message / Inquiries <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Ask about batch timings, fee structures, trial classes, or age eligibility..."
                    className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all resize-y"
                  ></textarea>
                </div>

                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-sm transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
                  >
                    <span>Submit Inquiry</span>
                    <Send className="w-4 h-4 text-amber-400" />
                  </button>
                </div>

              </form>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

