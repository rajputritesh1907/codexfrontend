import React from "react";
import { FiDownload } from "react-icons/fi";

const EditiorNavbar = ({ onDownload, title }) => {
  return (
    <>
      <div className="EditiorNavbar flex items-center justify-between px-[100px] h-[80px] bg-[#141414]">
        <p>
          File /{" "}
          <span className="text-[gray]">{title || "My first project"}</span>
        </p>
        <i
          onClick={onDownload}
          className="p-[8px] btn bg-black rounded-[5px] cursor-pointer text-[20px]"
        >
          <FiDownload />
        </i>
      </div>
    </>
  );
};

export default EditiorNavbar;
