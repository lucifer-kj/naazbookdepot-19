
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AdminBreadcrumbProps {
  items: BreadcrumbItem[];
}

export const AdminBreadcrumb = ({ items }: AdminBreadcrumbProps) => {
  return (
    <nav className="flex items-center text-sm mb-6">
      <Link
        to="/admin"
        className="flex items-center text-gray-500 hover:text-naaz-green"
      >
        <Home className="h-4 w-4 mr-1" />
        <span>Dashboard</span>
      </Link>
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
          {item.href && index < items.length - 1 ? (
            <Link
              to={item.href}
              className="text-gray-500 hover:text-naaz-green"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-naaz-green">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
