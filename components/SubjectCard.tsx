import React from "react";
import { Subject } from "../types";

interface SubjectCardProps {
  subject: Subject;
  onSelect: (subjectId: string) => void;
}

const SubjectCard: React.FC<SubjectCardProps> = ({ subject, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(subject.id)}
      className="bg-dark-card rounded-lg overflow-hidden border-2 border-dark-border cursor-pointer group transform hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-300 ease-in-out shadow-lg hover:shadow-2xl hover:border-brand-gold"
    >
      <div className="relative h-40 sm:h-48">
        <img
          src={subject.image}
          alt={subject.name}
          className="w-full h-full object-cover group-hover:scale-105 sm:group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-20 transition-opacity duration-300"></div>
      </div>
      <div className="p-4 sm:p-5">
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
          {subject.name}
        </h3>
        <p className="text-gray-400 text-sm">{subject.teacher}</p>
        <div className="mt-4">
          <span className="inline-block bg-brand-blue text-white text-xs font-semibold px-3 py-1 rounded-full group-hover:bg-brand-gold group-hover:text-black transition-colors duration-300">
            استعراض الوسائط
          </span>
        </div>
      </div>
    </div>
  );
};

export default SubjectCard;
