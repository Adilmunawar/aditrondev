
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface BasicInfoFormProps {
  username: string;
  setUsername: (value: string) => void;
  fullName: string;
  setFullName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  bio: string;
  setBio: (value: string) => void;
  gender: "male" | "female" | "other" | "";
  setGender: (value: "male" | "female" | "other" | "") => void;
  usernameError: string | null;
}

export const BasicInfoForm = ({
  username,
  setUsername,
  fullName,
  setFullName,
  email,
  setEmail,
  phoneNumber,
  setPhoneNumber,
  bio,
  setBio,
  gender,
  setGender,
  usernameError,
}: BasicInfoFormProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={`py-6 text-lg bg-gray-800 border-gray-700 text-white ${usernameError ? 'border-red-500' : ''}`}
          required
        />
        {usernameError && (
          <p className="text-sm text-red-500 mt-1">{usernameError}</p>
        )}
      </div>
      <div>
        <Input
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="py-6 text-lg bg-gray-800 border-gray-700 text-white"
          required
        />
      </div>
      <div>
        <Input
          placeholder="Phone Number"
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="py-6 text-lg bg-gray-800 border-gray-700 text-white"
        />
      </div>
      <div>
        <Input
          placeholder="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="py-6 text-lg bg-gray-800 border-gray-700 text-white"
          required
        />
      </div>
      <div className="space-y-2">
        <Label className="text-sm text-gray-300">Gender</Label>
        <RadioGroup 
          value={gender} 
          onValueChange={(value) => setGender(value as "male" | "female" | "other")}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="male" id="male" className="border-gray-600 text-blue-500" />
            <Label htmlFor="male" className="text-gray-300">Male</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="female" id="female" className="border-gray-600 text-blue-500" />
            <Label htmlFor="female" className="text-gray-300">Female</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="other" id="other" className="border-gray-600 text-blue-500" />
            <Label htmlFor="other" className="text-gray-300">Other</Label>
          </div>
        </RadioGroup>
      </div>
      <div>
        <Textarea
          placeholder="Bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="min-h-[100px] text-lg bg-gray-800 border-gray-700 text-white"
        />
      </div>
    </div>
  );
};
