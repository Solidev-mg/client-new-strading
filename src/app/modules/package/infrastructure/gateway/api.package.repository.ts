import {
  CreatePackageRequest,
  Package,
  PackageFilter,
  UpdatePackageRequest,
} from "../../domain/entities/package.entity";
import { PackageRepository } from "../../domain/repositories/package.repository";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export class ApiPackageRepository implements PackageRepository {
  async getPackages(filter?: PackageFilter): Promise<Package[]> {
    try {
      const queryParams = new URLSearchParams();

      if (filter?.status) {
        queryParams.append("status", filter.status);
      }
      if (filter?.searchTerm) {
        queryParams.append("search", filter.searchTerm);
      }
      if (filter?.shippingMode) {
        queryParams.append("shippingMode", filter.shippingMode);
      }
      if (filter?.dateFrom) {
        queryParams.append("dateFrom", filter.dateFrom.toISOString());
      }
      if (filter?.dateTo) {
        queryParams.append("dateTo", filter.dateTo.toISOString());
      }

      const token = localStorage.getItem("token");
      const parsedToken = token ? JSON.parse(token) : null;

      const response = await fetch(
        `${BASE_URL}packages?${queryParams.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${parsedToken?.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch packages");
      }

      const data = await response.json();
      return data.packages || [];
    } catch (error) {
      console.error("Error fetching packages:", error);
      throw error;
    }
  }

  async getPackageById(id: string): Promise<Package | null> {
    try {
      const token = localStorage.getItem("token");
      const parsedToken = token ? JSON.parse(token) : null;

      const response = await fetch(`${BASE_URL}packages/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${parsedToken?.accessToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error("Failed to fetch package");
      }

      const data = await response.json();
      return data.package;
    } catch (error) {
      console.error("Error fetching package:", error);
      throw error;
    }
  }

  async getPackageByTrackingNumber(
    trackingNumber: string
  ): Promise<Package | null> {
    try {
      const token = localStorage.getItem("token");
      const parsedToken = token ? JSON.parse(token) : null;

      const response = await fetch(
        `${BASE_URL}packages/tracking/${trackingNumber}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${parsedToken?.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error("Failed to fetch package");
      }

      const data = await response.json();
      return data.package;
    } catch (error) {
      console.error("Error fetching package by tracking number:", error);
      throw error;
    }
  }

  async createPackage(packageData: CreatePackageRequest): Promise<Package> {
    try {
      const token = localStorage.getItem("token");
      const parsedToken = token ? JSON.parse(token) : null;

      const response = await fetch(`${BASE_URL}packages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${parsedToken?.accessToken}`,
        },
        body: JSON.stringify(packageData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create package");
      }

      const data = await response.json();
      return data.package;
    } catch (error) {
      console.error("Error creating package:", error);
      throw error;
    }
  }

  async updatePackage(
    id: string,
    updates: UpdatePackageRequest
  ): Promise<Package> {
    try {
      const token = localStorage.getItem("token");
      const parsedToken = token ? JSON.parse(token) : null;

      const response = await fetch(`${BASE_URL}packages/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${parsedToken?.accessToken}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update package");
      }

      const data = await response.json();
      return data.package;
    } catch (error) {
      console.error("Error updating package:", error);
      throw error;
    }
  }

  async deletePackage(id: string): Promise<boolean> {
    try {
      const token = localStorage.getItem("token");
      const parsedToken = token ? JSON.parse(token) : null;

      const response = await fetch(`${BASE_URL}packages/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${parsedToken?.accessToken}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error("Error deleting package:", error);
      return false;
    }
  }

  async getPackageHistory(packageId: string): Promise<Package> {
    try {
      const token = localStorage.getItem("token");
      const parsedToken = token ? JSON.parse(token) : null;

      const response = await fetch(`${BASE_URL}packages/${packageId}/history`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${parsedToken?.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch package history");
      }

      const data = await response.json();
      return data.package;
    } catch (error) {
      console.error("Error fetching package history:", error);
      throw error;
    }
  }
}
