import axios, { AxiosError } from "axios";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import routes from "../routes";
import { baseUrl } from "../axiosClient";
import { verifyTokenAccess } from "../helpers";

interface NewFeedInterface {
  images?: FileList;
  location?: string;
  caption?: string;
  rating?: string;
}

const AddTravelLog = () => {
  const [fileArray, setFileArray] = useState<File[]>([]);
  const [preview, setPreview] = useState<any>();
  const [newFeed, setNewFeed] = useState<NewFeedInterface>({
    location: "",
    caption: "",
    rating: "",
  });
  const [cookies] = useCookies(["accessToken"]);
  const [feedErrors, setFeedErrors] = useState({ message: "" });
  const navigate = useNavigate();

  useEffect(() => {
    if (!verifyTokenAccess(cookies)) navigate(routes.LOGIN);
    window.scroll(0, 0);
  }, [feedErrors.message]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const { location, rating, caption } = newFeed;
    if (!location || !rating || !caption) {
      setFeedErrors({ message: "Please fill out all required fields." });
      setTimeout(() => setFeedErrors({ message: "" }), 4000);
      return;
    }

    if (fileArray.length > 4) {
      setFeedErrors({
        message: "You can not upload more than 4 files at once",
      });
      setTimeout(() => setFeedErrors({ message: "" }), 4000);
      return;
    }

    const formData = new FormData();

    formData.append("location", location as string);
    formData.append("rating", rating as string);
    formData.append("caption", caption as string);
    for (let i = 0; i < (newFeed.images as FileList).length; i++) {
      formData.append("images", (newFeed as any).images[i]);
    }
    const axiosInstance = axios.create({
      baseURL: baseUrl,
      withCredentials: true,
      timeout: 2000,
    });

    axiosInstance
      .post("/feed/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        console.log(res);

        if (res.status === 201) {
          //created
          navigate(routes.HOME, { replace: true });
        }
      })
      .catch((err: AxiosError) => {
        // Error: File must be of type jpg, jpeg or png
        if (err?.response) {
          if (
            err.response.status === 500 &&
            /Error: File must be of type jpg, jpeg or png/.test(
              err.response.data as string
            )
          ) {
            setFeedErrors({
              message: "Error: File must be of type jpg, jpeg or png",
            });
            setTimeout(() => setFeedErrors({ message: "" }), 4000);
          } else if (
            err.response.status === 500 &&
            /File too large/.test(err.response.data as string)
          ) {
            setFeedErrors({
              message: "Error: File(s) must be less than 2MB",
            });
            setTimeout(() => setFeedErrors({ message: "" }), 4000);
          }
        } else if (err.request) {
          console.log(err.request);
        } else {
          setFeedErrors({
            message: "An unexpected error occurred! Try again later.",
          });
          setTimeout(() => setFeedErrors({ message: "" }), 4000);
          console.log("Some other error", err.message);
        }
      });
  };
  return (
    <div className="div flex justify-center align-middle">
      <div>
        {feedErrors.message && (
          <p className="p-3 md:w-1/5 bg-red-200 rounded-md text-gray-600">
            {feedErrors.message}
          </p>
        )}
        <h1 className="text-2xl font-medium mb-5">Post a travel log</h1>
        <form
          className="space-y-5"
          onSubmit={(e: FormEvent) => handleSubmit(e)}
          encType="multipart/form-data"
        >
          {/* rating, caption, location, images, date */}
          <div className="form-gr">
            <label
              htmlFor="imgSet"
              className="px-3 py-2 bg-red-600 hover:bg-red-700 border-2 hover:border-gray-500 text-gray-100 rounded-lg w-[] cursor-pointer inline-flex mt-3"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-5 h-5 mx-3"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
              {fileArray.length ? (
                fileArray.length < 3 ? (
                  fileArray.map((file) => (
                    <b className="inline-block mr-2 underline">{file.name}</b>
                  ))
                ) : (
                  <b className="inline-block mr-2 underline">
                    {fileArray[0].name} and {fileArray.slice(1).length} others
                  </b>
                )
              ) : (
                "Choose your images and videos"
              )}
            </label>
            <input
              type="file"
              id="imgSet"
              accept="image/*, video/*"
              className="hidden"
              multiple
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const files = e.currentTarget.files;
                // get names
                if (files) {
                  setFileArray(Array.from(files));
                  // display image preview
                  if (files && files[0]) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      setPreview(e.target?.result);
                    };
                    reader.readAsDataURL(files[0]);
                  }
                  // update formData
                  setNewFeed((prev) => ({ ...prev, images: files }));
                }
              }}
            />
            <div className="img-preview mt-3">
              {preview && (
                <>
                  <p className="text-lg">Preview</p>
                  <img src={preview} width={200} height={200} alt="preview" />
                </>
              )}
            </div>
          </div>
          <div className="form-gr space-y-2">
            <label htmlFor="location">
              Where is this place? <span className="text-red-500">*</span>{" "}
            </label>
            <input
              type="text"
              name="location"
              placeholder="E.g., Bali, Indonesia"
              className="block py-2 px-3 border border-gray-200 outline-none rounded-lg bg-white"
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setNewFeed((prev) => ({ ...prev, location: e.target.value }))
              }
            />
          </div>
          <div className="form-gr space-y-2">
            <label htmlFor="caption">
              Caption: <span className="text-red-500">*</span>{" "}
            </label>
            <textarea
              name="caption"
              rows={5}
              cols={50}
              placeholder="E.g., Freedom! Love and lights #travels #festivities"
              className="block py-2 px-3 border border-gray-200 outline-none rounded-lg bg-white"
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                setNewFeed((prev) => ({ ...prev, caption: e.target.value }))
              }
            />
          </div>
          <div className="form-gr space-y-2">
            <label htmlFor="rating">
              Rate over 5 stars: <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="rating"
              min={0}
              max={5}
              className="block py-2 px-3 border border-gray-200 outline-none rounded-lg bg-white"
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setNewFeed((prev) => ({ ...prev, rating: e.target.value }))
              }
            />
          </div>
          <button
            className="px-3 py-2 bg-red-600 hover:bg-red-700 text-gray-100 rounded-lg w-[80px]"
            type="submit"
          >
            Post
          </button>
        </form>
      </div>
    </div>
  );
};
export default AddTravelLog;
