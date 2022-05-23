import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

type PageWrapperProps = {
  children: any;
};

const PageWrapper = ({ children }: PageWrapperProps) => {
  const privateKey = useSelector((state: any) => state.configs.privateKey);
  const navigate = useNavigate();
  useEffect(() => {
    if (!privateKey) {
      navigate("/unlock", { replace: true });
    }
  }, [privateKey, navigate]);
  if (!privateKey) return <div className="page-wrapper-container" />;
  return <div>{children}</div>;
};

export default PageWrapper;
