"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Calendar as CalendarIcon } from "lucide-react"
import { MainLayout } from "@/components/layout/main-layout"

export default function AuthPage() {
  const [dob, setDob] = useState<Date | undefined>()

  return (
    <MainLayout contentClassName="p-0">
      <div className="h-[calc(100vh-3.5rem)] w-full">
        <div className="grid h-full w-full lg:grid-cols-2">
          {/* Left panel - hidden on mobile */}
          <div className="hidden lg:flex bg-muted/40 p-10 flex-col justify-between">
            <div className="flex items-center">
              <h1 className="font-bold font-nordique-pro text-base leading-none">AppDashboard</h1>
            </div>
            <p className="text-xs text-muted-foreground max-w-sm">
              "This library has saved me countless hours of work and helped me deliver stunning designs to my clients faster than ever before." – Sofia Davis
            </p>
          </div>

          {/* Right panel */}
          <div className="relative p-6 sm:p-10">
            <div className="mx-auto w-full max-w-md flex flex-col items-center justify-center h-full">
              <div className="w-full space-y-6">
                <div className="space-y-1 text-center">
                  <h1 className="text-2xl font-semibold tracking-tight">
                    Welcome to AppDashboard
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred sign-in method
                  </p>
                </div>

                <Tabs defaultValue="signin" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="signin">Sign In</TabsTrigger>
                    <TabsTrigger value="register">Registration</TabsTrigger>
                  </TabsList>

                  {/* Sign In Tab */}
                  <TabsContent value="signin" className="space-y-4 mt-6">
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Input id="email" type="email" placeholder="name@example.com" />
                      </div>
                      <Button className="w-full">
                        Sign In with Email
                      </Button>
                      <div className="relative my-2">
                        <Separator />
                        <span className="absolute inset-0 -top-3 mx-auto w-fit bg-background px-2 text-xs text-muted-foreground">
                          Or continue with
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" className="w-full justify-center">
                          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                            <path
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                              fill="#4285F4"
                            />
                            <path
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                              fill="#34A853"
                            />
                            <path
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                              fill="#FBBC05"
                            />
                            <path
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                              fill="#EA4335"
                            />
                          </svg>
                          Google
                        </Button>
                        <Button variant="outline" className="w-full justify-center">
                          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="#1877F2">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                          Facebook
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Registration Tab */}
                  <TabsContent value="register" className="space-y-4 mt-6">
                    <div className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="first-name">First Name</Label>
                          <Input id="first-name" placeholder="John" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="last-name">Last Name</Label>
                          <Input id="last-name" placeholder="Doe" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label>Gender</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label>Date of Birth</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="justify-start font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dob ? dob.toLocaleDateString() : "Pick a date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-0" align="start">
                              <Calendar 
                                mode="single" 
                                selected={dob} 
                                onSelect={setDob} 
                                captionLayout="dropdown"
                                fromYear={1900}
                                toYear={new Date().getFullYear()}
                                defaultMonth={new Date(2000, 0)}
                                classNames={{
                                  caption_label: 'sr-only',
                                  caption: 'flex justify-center pt-1 items-center',
                                  caption_dropdowns: 'flex items-center gap-2',
                                  dropdown: 'h-8 rounded-md border bg-background px-2 text-sm',
                                  dropdown_month: 'w-[120px]',
                                  dropdown_year: 'w-[100px]',
                                }}
                                initialFocus 
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" placeholder="name@example.com" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="mobile">Mobile</Label>
                          <Input id="mobile" type="tel" placeholder="0123456789" />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" placeholder="••••••••" />
                      </div>
                      <Button className="w-full">
                        Create Account
                      </Button>
                      <div className="relative my-2">
                        <Separator />
                        <span className="absolute inset-0 -top-3 mx-auto w-fit bg-background px-2 text-xs text-muted-foreground">
                          Or continue with
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" className="w-full justify-center">
                          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                            <path
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                              fill="#4285F4"
                            />
                            <path
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                              fill="#34A853"
                            />
                            <path
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                              fill="#FBBC05"
                            />
                            <path
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                              fill="#EA4335"
                            />
                          </svg>
                          Google
                        </Button>
                        <Button variant="outline" className="w-full justify-center">
                          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="#1877F2">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                          Facebook
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="text-center text-xs text-muted-foreground">
                  By clicking continue, you agree to our{" "}
                  <Link href="#" className="underline underline-offset-4">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="#" className="underline underline-offset-4">
                    Privacy Policy
                  </Link>
                  .
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
