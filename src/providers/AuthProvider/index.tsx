import { createContext, ReactNode, useContext, useState } from "react";

export interface IAuthContext {}

export const AuthContext = createContext<IAuthContext>({});

export function useAuth(): IAuthContext {
  return useContext(AuthContext);
}

interface IAuthProps {
  children?: ReactNode;
}

const AuthProvider = ({ children }: IAuthProps) => {
  const [loading, setLoading] = useState(false);
  return (
    <AuthContext.Provider value={{}}>
      {loading && (
        <div
          style={{
            height: "100vh",
          }}
        />
      )}
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
