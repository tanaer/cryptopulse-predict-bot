"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button className="w-full" type="submit" disabled={pending || disabled}>
      {pending ? "提交中..." : "确认绑定"}
    </Button>
  );
}

export function BindConfirmForm({
  code,
  action,
  initialData
}: {
  code: string;
  action: (formData: FormData) => void | Promise<void>;
  initialData?: {
    polymarketAddress?: string;
    safeAddress?: string;
    funderAddress?: string;
  };
}) {
  const [copied, setCopied] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [values, setValues] = React.useState({
    polymarketAddress: initialData?.polymarketAddress ?? "",
    safeAddress: initialData?.safeAddress ?? "",
    funderAddress: initialData?.funderAddress ?? ""
  });

  const validate = (name: string, value: string) => {
    if (!value) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
      return;
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(value)) {
      setErrors((prev) => ({ ...prev, [name]: "格式错误：需为 0x 开头的 40 位十六进制地址" }));
    } else {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    validate(name, value);
  };

  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const hasError = Object.keys(errors).length > 0;
  const allEmpty = !values.polymarketAddress && !values.safeAddress && !values.funderAddress;

  return (
    <form action={action} className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-medium text-neutral-900">绑定码</div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(code);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1500);
              } catch {
                setCopied(false);
              }
            }}
          >
            {copied ? "已复制" : "复制"}
          </Button>
        </div>
        <Input name="code" value={code} readOnly className="bg-neutral-50 font-mono text-neutral-600" />
        <div className="text-xs text-neutral-500">
          此绑定码用于验证你的 Telegram 身份。
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="polymarketAddress" className="text-sm font-medium text-neutral-900">
            Polymarket 钱包地址 (EOA)
          </label>
          <Input
            id="polymarketAddress"
            name="polymarketAddress"
            placeholder="0x..."
            value={values.polymarketAddress}
            onChange={handleChange}
            className={errors.polymarketAddress ? "border-red-500 focus-visible:ring-red-500 font-mono" : "font-mono"}
          />
          {errors.polymarketAddress ? (
            <div className="text-xs text-red-500">{errors.polymarketAddress}</div>
          ) : (
            <div className="text-xs text-neutral-500">
              请填写你在 Polymarket 使用的钱包地址（Metamask/Coinbase Wallet 等）。
            </div>
          )}
        </div>

        <div className="pt-2">
          <button
            type="button"
            className="flex items-center text-xs text-neutral-500 hover:text-neutral-900 transition-colors"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <span className="mr-1">{showAdvanced ? "▼" : "▶"}</span>
            高级选项 (Safe / Proxy)
          </button>
          
          {showAdvanced && (
            <div className="mt-3 space-y-4 pl-2 border-l-2 border-neutral-100">
              <div className="space-y-1">
                <label htmlFor="safeAddress" className="text-sm font-medium text-neutral-700">Safe 地址 (可选)</label>
                <Input
                  id="safeAddress"
                  name="safeAddress"
                  placeholder="0x..."
                  value={values.safeAddress}
                  onChange={handleChange}
                  className={errors.safeAddress ? "border-red-500 focus-visible:ring-red-500 font-mono" : "font-mono"}
                />
                {errors.safeAddress && (
                  <div className="text-xs text-red-500">{errors.safeAddress}</div>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="funderAddress" className="text-sm font-medium text-neutral-700">Funder 地址 (可选)</label>
                <Input
                  id="funderAddress"
                  name="funderAddress"
                  placeholder="0x..."
                  value={values.funderAddress}
                  onChange={handleChange}
                  className={errors.funderAddress ? "border-red-500 focus-visible:ring-red-500 font-mono" : "font-mono"}
                />
                {errors.funderAddress && (
                  <div className="text-xs text-red-500">{errors.funderAddress}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {allEmpty && (
        <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-800 border border-amber-200">
          <strong>注意：</strong> 未填写任何地址，提交后将<strong>解绑</strong>当前账户。
        </div>
      )}

      <SubmitButton disabled={hasError} />
    </form>
  );
}

