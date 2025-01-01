import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

import dotenv from 'dotenv';
dotenv.config();


cloudinary.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const AssetStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "bacr/client",
    resource_type: "auto",
    allowed_formats: [
      "jpg",
      "jpeg",
      "png",
      "webp",
    ],
  },
});

const FooterStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "bacr/footercert",
    resource_type: "auto",
    allowed_formats: [
      "jpg",
      "jpeg",
      "png",
      "webp",
    ],
  },
});
const CareerStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "bacr/career",
      resource_type: "auto",
      allowed_formats: [
        "jpg",
        "jpeg",
        "png",
        "webp",
      ],
    },
  });
const BlogStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "bacr/blogs",
    resource_type: "auto",
    allowed_formats: [
      "jpg",
      "jpeg",
      "xlsx",
      "csv",
      "png",
      "webp",
    ],
  },
});
const CertificateStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "bacr/certificates",
      resource_type: "auto",
      allowed_formats: [
        "jpg",
        "jpeg",
        "png",
        "webp",
      ],
    },
  });
const ProductStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "bacr/products",
      resource_type: "auto",
      allowed_formats: [
        "jpg",
        "jpeg",
        "png",
        "webp",
      ],
    },
  });
const ProjectStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "bacr/projects",
      resource_type: "auto",
      allowed_formats: [
        "jpg",
        "jpeg",
        "png",
        "webp",
      ],
    },
  });
const TeamStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "bacr/teams",
      resource_type: "auto",
      allowed_formats: [
        "jpg",
        "jpeg",
        "png",
        "webp",
      ],
    },
  });
// const CareerStorage = new CloudinaryStorage({
//     cloudinary,
//     params: {
//       folder: "bacr/careers",
//       resource_type: "auto",
//       allowed_formats: [
//         "jpg",
//         "jpeg",
//         "png",
//         "webp",
//         "pdf",
//         "doc"
//       ],
//     },
//   });

const JobStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "bacr/jobs",
      resource_type: "auto",
      allowed_formats: [
        "jpg",
        "jpeg",
        "png",
        "webp",
        "pdf",
        "doc"
      ],
    },
  });
const BrandStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "bacr/brands",
      resource_type: "auto",
      allowed_formats: [
        "jpg",
        "jpeg",
        "png",
        "webp",
      ],
    },
  });


export { ProductStorage, cloudinary,BrandStorage,BlogStorage, CertificateStorage, AssetStorage,ProjectStorage,TeamStorage,JobStorage,CareerStorage,FooterStorage };