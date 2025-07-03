"use client"

import { useParams } from "next/navigation"
import PropertyHeader from "./components/property-header"
import PropertyImages from "./components/property-images"
import PropertyInfo from "./components/property-info"
import PropertyFloorPlans from "./components/property-floor-plans"
import PropertyAmenities from "./components/property-amenities"
import PropertyLocation from "./components/property-location"
import PropertyAbout from "./components/property-about"
import PropertyBrokerage from "./components/property-brokerage"
import PropertyMilestones from "./components/property-milestones"
import PropertyPaymentPlan from "./components/property-payment-plan"
import PropertyLoanInfo from "./components/property-loan-info"
import PropertyCTA from "./components/property-cta"
import { AboutBuilder } from "./components/about-builder"
import { BrochureCard } from "./components/brochure-card"
import { PriceTrend } from "./components/price-trend"
import { Ratings } from "./components/ratings"
import { TermsConditions } from "./components/terms-conditions"
import PropertyDescription from "./components/property-description"

export default function PropertyDetails() {
  const params = useParams()
  const propertyId = params.id as string

  return (
    <div className="pb-20">
      <PropertyHeader propertyId={propertyId} />
      <PropertyImages propertyId={propertyId} />
      <PropertyInfo propertyId={propertyId} />
      <PropertyDescription propertyId={propertyId} />
         <PropertyLocation propertyId={propertyId} />
       <PropertyAmenities propertyId={propertyId} />
      <PropertyFloorPlans propertyId={propertyId} />
     
   
      <PropertyAbout propertyId={propertyId} />
    
      <AboutBuilder propertyId={propertyId} />
      <BrochureCard propertyId={propertyId} />
          {/* <Ratings propertyId={propertyId} />
      <PriceTrend /> */}
  
      {/* <TermsConditions /> */}
 
        <PropertyPaymentPlan propertyId={propertyId} />
      <PropertyLoanInfo propertyId={propertyId} />
      <PropertyBrokerage propertyId={propertyId} />
      <PropertyMilestones propertyId={propertyId} />
    
      <PropertyCTA propertyId={propertyId} />
      
    </div>
  )
}

