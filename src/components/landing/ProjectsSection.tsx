"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ArrowRight, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ProjectsSection() {
  const projects = useQuery(api.projects.list);
  const { t } = useLanguage();

  return (
    <section className="py-16 bg-white" id="proyek">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button aria-label="Proyek sebelumnya" className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-600" aria-hidden="true" />
            </button>
            <button aria-label="Proyek selanjutnya" className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
              <ChevronRight className="w-5 h-5 text-gray-600" aria-hidden="true" />
            </button>
            <h2 className="font-display font-bold text-2xl md:text-3xl text-gray-900">
              {t("Proyek Layanan Ekosistem Mangrove", "Mangrove Ecosystem Service Projects")}
            </h2>
          </div>
          <a
            href="/proyek"
            className="hidden md:flex items-center gap-1 text-emerald-600 font-semibold text-sm hover:text-emerald-700"
          >
            {t("Lihat Semua Proyek", "View All Projects")}
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects === undefined
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              ))
            : projects.slice(0, 6).map((project) => (
                <div
                  key={project._id}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
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
                    <p className="text-xs text-emerald-600 font-medium">
                      {new Intl.NumberFormat("id-ID").format(project.co2Absorption)} tCO₂e
                    </p>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
