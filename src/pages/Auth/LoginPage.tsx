import {
  Form,
  useActionData,
  useNavigation,
} from "react-router-dom";

/**
 * @description Datos devueltos por loginAction.
 */
interface ActionData {
  error?: string;
}

/**
 * @description Página pública de inicio de sesión.
 */
export const LoginPage = () => {
  /**
   * Datos retornados por la action.
   */
  const actionData =
    useActionData() as ActionData | undefined;

  /**
   * Estado de navegación del formulario.
   */
  const navigation = useNavigation();

  /**
   * Indica si el formulario está enviándose.
   */
  const isSubmitting =
    navigation.state === "submitting";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 p-4">
      {/* Fondo */}
      <div className="absolute inset-0">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYLmBH3kOq_8cBEbuLCyg1EwsdoQf-WK1qHv0PUJCDXjZZ-tod2Wh9pteIMK84yq4x9RdQb_nBFf5oQJW38CRKKXrSJUmhuJGUcso9mwww7Lcoqb1R3AYe9mI9AuDZ5Nmt55NXWQVfsE7A5sZGcDh6-b34XE33cjIQ6daijOfuJU544Y6umb1srszehNnxt9tTWQLusCt_6z4KGaiqdmRdmPwKTg-BtEsIc_lRuN-rETRM-kG8jBnWZy9peYJQUT1sKwakLT0hAR4"
          alt="Fondo restaurante"
          className="h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-600 shadow-lg">
            <span className="material-symbols-outlined text-4xl text-white">
              restaurant
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white">
            El Buen Sabor
          </h1>

          <p className="mt-2 text-sm uppercase tracking-[0.3em] text-orange-300">
            Gestión de Restaurante
          </p>
        </div>

        {/* Formulario */}
        <Form method="post" className="space-y-5">
          {/* Legajo */}
          <div className="space-y-2">
            <label
              htmlFor="legajo"
              className="text-xs font-bold uppercase tracking-widest text-zinc-300"
            >
              Legajo
            </label>

            <input
              id="legajo"
              name="legajo"
              type="text"
              placeholder="Ingrese su legajo"
              required
              className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-4 text-white placeholder:text-zinc-400 focus:border-orange-500 focus:outline-none"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-xs font-bold uppercase tracking-widest text-zinc-300"
            >
              Contraseña
            </label>

            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-4 text-white placeholder:text-zinc-400 focus:border-orange-500 focus:outline-none"
            />
          </div>

          {/* Error */}
          {actionData?.error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {actionData.error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-orange-600 py-4 font-semibold text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting
              ? "Ingresando..."
              : "Iniciar sesión"}
          </button>
        </Form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-zinc-400">
            © 2026 El Buen Sabor
          </p>
        </div>
      </div>
    </div>
  );
};