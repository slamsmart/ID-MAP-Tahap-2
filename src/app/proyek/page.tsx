"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { MapPin, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import Link from "next/link";

export default function AllProjectsPage() {
  const projects = useQuery(api.projects.list);
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <Link href="/#proyek" className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium mb-4">
                <ArrowLeft className="w-4 h-4" />
                {t("Kembali ke Beranda", "Back to Home")}
              </Link>
              <h1 className="font-display font-bold text-3xl md:text-4xl text-gray-900">
                {t("Semua Proyek Mangrove", "All Mangrove Projects")}
              </h1>
              <p className="text-gray-500 mt-2">
                {t("Jelajahi seluruh inisiatif karbon biru yang terverifikasi di Indonesia.", "Explore all verified blue carbon initiatives in Indonesia.")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects === undefined
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-200" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                      <div className="h-3 bg-gray-200 rounded w-1/3" />
                    </div>
                  </div>
                ))
              : projects.map((project) => (
                  <Link
                    key={project._id}
                    href={`/donasi-cepat/${project._id}`}
                    className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer block focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <div className="relative h-48 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                          {project.status}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      {project.serviceType && (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 mb-1.5">
                          {project.serviceType}
                        </span>
                      )}
                      <h3 className="font-display font-semibold text-gray-900 mb-1">
                        {project.title}
                      </h3>
                      <div className="flex items-center gap-1 text-gray-500 text-sm mb-2">
                        <MapPin className="w-3.5 h-3.5" />
                        {project.location}
                      </div>
                      <p className="text-xs text-emerald-600 font-medium mb-3">
                        {new Intl.NumberFormat("id-ID").format(project.co2Absorption)} tCO₂e
                      </p>
                      <span className="inline-flex items-center justify-center w-full px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold group-hover:bg-emerald-700 transition-colors">
                        {t("Dukung Proyek Ini", "Support This Project")}
                      </span>
                    </div>
                  </Link>
                ))}
          </div>
          
          {projects !== undefined && projects.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <p className="text-gray-500">{t("Belum ada proyek yang terverifikasi saat ini.", "No verified projects available at the moment.")}</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
