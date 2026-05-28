import svgPaths from "./svg-3ehbc7nfi3";
import imgNoise from "figma:asset/cc45c3ddcd936b71fb7e724e08f34e14b730641f.png";
import imgSwadeLogo1 from "figma:asset/67add97ed14c84d523aae1fbf085fa30ece7696d.png";

function Frame() {
  return (
    <div className="content-stretch flex font-['Inter:Bold',sans-serif] font-bold gap-[2px] items-center justify-end leading-[20px] not-italic relative shrink-0 text-[#6735f4] text-[14px] text-right">
      <p className="relative shrink-0">US$</p>
      <p className="relative shrink-0 tracking-[-0.14px]">107.50</p>
    </div>
  );
}

function Frame9() {
  return (
    <div className="absolute bg-[#e3fa7d] content-stretch flex flex-col items-end justify-center pl-[12px] pr-[40px] py-[6px] right-0 top-[180px]">
      <Frame />
    </div>
  );
}

function Frame7() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[2px] items-start left-[108px] not-italic top-[32px]">
      <p className="font-['Inter:Bold',sans-serif] font-bold leading-[24px] relative shrink-0 text-[#1a1c21] text-[18px]">Swade Ltd.</p>
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[14px] relative shrink-0 text-[#5e6470] text-[10px]">office@swadeart.com.ng</p>
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[14px] relative shrink-0 text-[#5e6470] text-[10px]">+2348102604019</p>
    </div>
  );
}

function Frame12() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[6px] items-end left-[440px] text-right top-[32px]">
      <p className="font-['Archivo:SemiBold',sans-serif] font-semibold leading-[40px] relative shrink-0 text-[#b2b7c2] text-[36px] tracking-[-1.08px]" style={{ fontVariationSettings: "\'wdth\' 100" }}>
        Invoice
      </p>
      <p className="font-['Archivo:Medium',sans-serif] font-medium leading-[16px] relative shrink-0 text-[#5e6470] text-[12px] tracking-[0.24px]" style={{ fontVariationSettings: "\'wdth\' 100" }}>
        #89144
      </p>
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex flex-col gap-[2px] items-center relative shrink-0">
      <p className="leading-[12px] relative shrink-0 text-[#5e6470] text-[8px] tracking-[0.32px] uppercase w-[72px]">Invoice date</p>
      <p className="leading-[14px] relative shrink-0 text-[#1a1c21] text-[10px] w-[72px]">02.01.2026</p>
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex flex-col gap-[2px] items-center relative shrink-0">
      <p className="leading-[12px] relative shrink-0 text-[#5e6470] text-[8px] tracking-[0.32px] uppercase w-[72px]">Due date</p>
      <p className="leading-[14px] relative shrink-0 text-[#1a1c21] text-[10px] w-[72px]">{`16.01   .2026`}</p>
    </div>
  );
}

function Frame8() {
  return (
    <div className="-translate-x-1/2 absolute content-stretch flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold gap-[20px] items-center justify-center left-[calc(50%-0.5px)] not-italic text-center top-[136px] w-[72px] whitespace-pre-wrap">
      <Frame6 />
      <Frame5 />
    </div>
  );
}

function Frame13() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[10px] h-[64px] items-center justify-center left-[35px] p-[10px] top-[29px] w-[66px]">
      <div className="aspect-[111/81] relative shrink-0 w-full" data-name="SwadeLogo 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgSwadeLogo1} />
      </div>
      <div className="bg-[#2f2b2b] h-[9px] shrink-0 w-[47px]" />
    </div>
  );
}

function Group() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[12px] not-italic place-items-start relative shrink-0 text-[8px] whitespace-pre-wrap">
      <p className="col-1 font-['Inter:Medium',sans-serif] font-medium ml-0 mt-[12px] relative row-1 text-[#5e6470] tracking-[0.08px] w-[143px]">Silas Shaibu</p>
      <p className="col-1 font-['Inter:Semi_Bold',sans-serif] font-semibold ml-0 mt-0 relative row-1 text-[#1a1c21] tracking-[0.32px] uppercase w-[100.134px]">Account Name</p>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex flex-col items-start leading-[12px] not-italic relative shrink-0 text-[8px]">
      <p className="font-['Inter:Medium',sans-serif] font-medium relative shrink-0 text-[#1a1c21] tracking-[0.08px]">Bank name</p>
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold relative shrink-0 text-[#5e6470] tracking-[0.32px]">WELLS FARGO BANK, N.A</p>
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex flex-col items-start leading-[12px] not-italic relative shrink-0 text-[8px]">
      <p className="font-['Inter:Medium',sans-serif] font-medium relative shrink-0 text-[#1a1c21] tracking-[0.08px]">Routing #</p>
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold relative shrink-0 text-[#5e6470] tracking-[0.32px]">121000248</p>
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex flex-col items-start leading-[12px] not-italic relative shrink-0 text-[8px]">
      <p className="font-['Inter:Medium',sans-serif] font-medium relative shrink-0 text-[#1a1c21] tracking-[0.08px]">Account #</p>
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold relative shrink-0 text-[#5e6470] tracking-[0.32px]">40630192530806597</p>
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex flex-col items-start leading-[12px] not-italic relative shrink-0 text-[8px] w-[55px]">
      <p className="font-['Inter:Medium',sans-serif] font-medium relative shrink-0 text-[#1a1c21] tracking-[0.08px]">Account Type</p>
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold relative shrink-0 text-[#5e6470] tracking-[0.32px] w-[92px] whitespace-pre-wrap">Checking</p>
    </div>
  );
}

function Frame11() {
  return (
    <div className="absolute content-stretch flex gap-[12px] items-center left-[40px] top-[786px] w-[515px]">
      <Group />
      <Frame1 />
      <div className="h-[20px] relative shrink-0 w-0">
        <div className="absolute inset-[-1.25%_-0.25px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 0.5 20.5">
            <path d="M0.25 0.25V20.25" id="Vector 128" stroke="var(--stroke-0, #D7DAE0)" strokeLinecap="round" strokeWidth="0.5" />
          </svg>
        </div>
      </div>
      <Frame2 />
      <div className="h-[20px] relative shrink-0 w-0">
        <div className="absolute inset-[-1.25%_-0.25px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 0.5 20.5">
            <path d="M0.25 0.25V20.25" id="Vector 128" stroke="var(--stroke-0, #D7DAE0)" strokeLinecap="round" strokeWidth="0.5" />
          </svg>
        </div>
      </div>
      <Frame3 />
      <Frame4 />
    </div>
  );
}

function Frame10() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[2px] items-start leading-[14px] left-[40px] not-italic top-[136px]">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold relative shrink-0 text-[#5e6470] text-[8px] tracking-[0.32px] uppercase">Billed to</p>
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold relative shrink-0 text-[#1a1c21] text-[10px]">Optimum Payment Solutions</p>
      <div className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#5e6470] text-[10px] whitespace-nowrap">
        <p className="mb-0">Company address</p>
        <p>Indiana, U.S.A - 00000</p>
      </div>
      <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#5e6470] text-[10px]">+0 (000) 123-4567</p>
    </div>
  );
}

function Icon() {
  return (
    <div className="h-[14px] relative shrink-0 w-[10px]" data-name="icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 14">
        <g id="icon">
          <path clipRule="evenodd" d={svgPaths.p24743b40} fill="var(--fill-0, #8B919E)" fillRule="evenodd" id="icon_2" />
        </g>
      </svg>
    </div>
  );
}

function Terms() {
  return (
    <div className="absolute bottom-[394px] content-stretch flex gap-[6px] items-start right-[301px]" data-name="Terms">
      <Icon />
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[14px] not-italic relative shrink-0 text-[#5e6470] text-[10px]">Please pay within 15 days of receiving this invoice.</p>
    </div>
  );
}

function Group2() {
  return (
    <div className="absolute bottom-[394px] contents right-[301px]">
      <Terms />
    </div>
  );
}

function Icon1() {
  return (
    <div className="col-1 h-[14px] ml-0 mt-0 relative row-1 w-[10px]" data-name="icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 14">
        <g id="icon">
          <path clipRule="evenodd" d={svgPaths.p24743b40} fill="var(--fill-0, #8B919E)" fillRule="evenodd" id="icon_2" />
        </g>
      </svg>
    </div>
  );
}

function Group5() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <Icon1 />
      <p className="col-1 font-['Inter:Regular',sans-serif] font-normal h-[14px] leading-[14px] ml-[16px] mt-0 not-italic relative row-1 text-[#5e6470] text-[10px] w-[239px] whitespace-pre-wrap">Payment terms are by return unless previously agreed with Swade Ltd. Invoices which are not paid by these terms will be charged an additional 0%per late day.</p>
    </div>
  );
}

function Terms1() {
  return (
    <div className="absolute bottom-[333px] content-stretch flex h-[58px] items-start right-[301px]" data-name="Terms">
      <Group5 />
    </div>
  );
}

function Group4() {
  return (
    <div className="absolute bottom-[333px] contents right-[301px]">
      <Terms1 />
    </div>
  );
}

function LineTotal() {
  return (
    <div className="absolute content-stretch flex font-['Inter:Medium',sans-serif] font-medium gap-px items-center justify-end leading-[14px] not-italic right-[40px] text-[#5e6470] text-[10px] text-right top-[296px]" data-name="Line total">
      <p className="relative shrink-0">$</p>
      <p className="relative shrink-0">107.50</p>
    </div>
  );
}

function Rate() {
  return (
    <div className="absolute content-stretch flex font-['Inter:Medium',sans-serif] font-medium gap-px items-center justify-end leading-[14px] not-italic right-[167px] text-[#5e6470] text-[10px] text-right top-[296px]" data-name="rate">
      <p className="relative shrink-0">$</p>
      <p className="relative shrink-0">100.00</p>
    </div>
  );
}

function Description() {
  return <div className="absolute h-[14px] left-[40px] top-[314px] w-[215px]" data-name="Description" />;
}

function Group1() {
  return (
    <div className="absolute contents left-[40px] top-[262px]">
      <div className="absolute h-0 left-[40px] top-[286px] w-[515px]">
        <div className="absolute inset-[-0.25px_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 515 0.5">
            <path d="M0 0.25H515" id="Vector 29" stroke="var(--stroke-0, #D7DAE0)" strokeWidth="0.5" />
          </svg>
        </div>
      </div>
      <div className="absolute h-0 left-[40px] top-[421px] w-[515px]">
        <div className="absolute inset-[-0.25px_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 515 0.5">
            <path d="M0 0.25H515" id="Vector 29" stroke="var(--stroke-0, #D7DAE0)" strokeWidth="0.5" />
          </svg>
        </div>
      </div>
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[14px] left-[40px] not-italic text-[#1a1c21] text-[10px] top-[262px]">Service(s)</p>
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[14px] not-italic right-[167px] text-[#1a1c21] text-[10px] text-right top-[262px] w-[60px] whitespace-pre-wrap">Net Amount</p>
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[14px] not-italic right-[243px] text-[#1a1c21] text-[10px] text-right top-[262px] w-[71px] whitespace-pre-wrap">Unit Price</p>
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[14px] not-italic right-[127px] text-[#1a1c21] text-[10px] text-right top-[262px] w-[36px] whitespace-pre-wrap">VAT%</p>
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[14px] not-italic right-[95px] text-[#1a1c21] text-[10px] text-right top-[262px] w-[23px] whitespace-pre-wrap">VAT</p>
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[14px] left-[271px] not-italic text-[#1a1c21] text-[10px] top-[262px] w-[21px] whitespace-pre-wrap">Qty</p>
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[14px] not-italic right-[40px] text-[#1a1c21] text-[10px] text-right top-[262px] w-[51px] whitespace-pre-wrap">Line total</p>
      <LineTotal />
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[14px] left-[282px] not-italic text-[#5e6470] text-[10px] top-[296px] w-[5px] whitespace-pre-wrap">1</p>
      <Rate />
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[14px] left-[40px] not-italic text-[#1a1c21] text-[10px] top-[296px]">{`Website Design & Development`}</p>
      <Description />
    </div>
  );
}

function Rate1() {
  return (
    <div className="absolute content-stretch flex font-['Inter:Medium',sans-serif] font-medium gap-px items-center justify-end leading-[14px] not-italic right-[243px] text-[#5e6470] text-[10px] text-right top-[296px]" data-name="rate">
      <p className="relative shrink-0">$</p>
      <p className="relative shrink-0">100.00</p>
    </div>
  );
}

function Sub() {
  return (
    <div className="absolute content-stretch flex font-['Inter:Medium',sans-serif] font-medium gap-px items-center justify-end leading-[14px] not-italic right-[40px] text-[#5e6470] text-[10px] text-right top-[434px]" data-name="sub">
      <p className="relative shrink-0">$</p>
      <p className="relative shrink-0">107.50</p>
    </div>
  );
}

function Tax() {
  return (
    <div className="absolute content-stretch flex font-['Inter:Medium',sans-serif] font-medium gap-px items-center justify-end leading-[14px] not-italic right-[40px] text-[#5e6470] text-[10px] text-right top-[468px]" data-name="tax">
      <p className="relative shrink-0">$</p>
      <p className="relative shrink-0">0.00</p>
    </div>
  );
}

function Total() {
  return (
    <div className="absolute content-stretch flex font-['Inter:Medium',sans-serif] font-medium gap-px items-center justify-end leading-[14px] not-italic right-[40px] text-[#1a1c21] text-[10px] text-right top-[502px]" data-name="total">
      <p className="relative shrink-0">$</p>
      <p className="relative shrink-0">107.50</p>
    </div>
  );
}

function Amount() {
  return (
    <div className="content-stretch flex font-['Inter:Bold',sans-serif] font-bold gap-[2px] items-center justify-end leading-[0] not-italic relative shrink-0 text-[#7241fa] text-[10px] text-right whitespace-nowrap" data-name="amount">
      <div className="flex flex-col justify-center relative shrink-0">
        <p className="leading-[14px]">US$</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0">
        <p className="leading-[14px]">107.50</p>
      </div>
    </div>
  );
}

function Due() {
  return (
    <div className="absolute content-stretch flex gap-[48px] items-start left-[352px] py-[10px] top-[526px] w-[203px]" data-name="Due">
      <div aria-hidden="true" className="absolute border-[#7c4dff] border-b-[1.5px] border-solid border-t-[1.5px] inset-0 pointer-events-none" />
      <div className="flex flex-[1_0_0] flex-col font-['Inter:Bold',sans-serif] font-bold justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#7241fa] text-[10px]">
        <p className="leading-[14px] whitespace-pre-wrap">Amount due</p>
      </div>
      <Amount />
    </div>
  );
}

function Group3() {
  return (
    <div className="absolute contents left-[352px] top-[434px]">
      <div className="absolute h-0 left-[352px] top-[458px] w-[203px]">
        <div className="absolute inset-[-0.25px_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 203 0.5">
            <path d="M0 0.25H203" id="Vector 135" stroke="var(--stroke-0, #D7DAE0)" strokeWidth="0.5" />
          </svg>
        </div>
      </div>
      <div className="absolute h-0 left-[352px] top-[492px] w-[203px]">
        <div className="absolute inset-[-0.25px_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 203 0.5">
            <path d="M0 0.25H203" id="Vector 135" stroke="var(--stroke-0, #D7DAE0)" strokeWidth="0.5" />
          </svg>
        </div>
      </div>
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[14px] left-[352px] not-italic text-[#1a1c21] text-[10px] top-[434px]">Subtotal</p>
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[14px] left-[352px] not-italic text-[#1a1c21] text-[10px] top-[468px]">State Tax (0%)</p>
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[14px] left-[352px] not-italic text-[#1a1c21] text-[10px] top-[502px]">Total</p>
      <Sub />
      <Tax />
      <Total />
      <Due />
    </div>
  );
}

export default function Invoice() {
  return (
    <div className="bg-[#f9fafc] relative size-full" data-name="Invoice 8">
      <Frame9 />
      <div className="absolute h-[842px] left-0 top-0 w-[595px]" data-name="Noise">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgNoise} />
      </div>
      <div className="absolute flex h-[842px] items-center justify-center left-0 top-0 w-[595px]">
        <div className="flex-none rotate-180">
          <div className="h-[842px] relative w-[595px]" data-name="Noise">
            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgNoise} />
          </div>
        </div>
      </div>
      <div className="absolute h-0 left-[110px] top-[768px] w-[445px]">
        <div className="absolute inset-[-0.25px_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 445 0.5">
            <path d="M0 0.25H445" id="Vector 7" stroke="var(--stroke-0, #D7DAE0)" strokeWidth="0.5" />
          </svg>
        </div>
      </div>
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[14px] left-[39px] not-italic text-[#5e6470] text-[10px] top-[666px]">Thank you for the business!</p>
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[12px] left-[40px] not-italic text-[#5e6470] text-[8px] top-[762px] tracking-[0.32px] uppercase">Payment info</p>
      <Frame7 />
      <Frame12 />
      <Frame8 />
      <p className="-translate-x-full absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[12px] left-[555px] not-italic text-[#5e6470] text-[8px] text-right top-[164px] tracking-[0.32px] uppercase">Amount due</p>
      <Frame13 />
      <Frame11 />
      <Frame10 />
      <Group2 />
      <Group4 />
      <Group1 />
      <Rate1 />
      <p className="-translate-x-full absolute font-['Inter:Medium',sans-serif] font-medium leading-[14px] left-[499px] not-italic text-[#5e6470] text-[10px] text-right top-[296px]">$7.50</p>
      <p className="-translate-x-full absolute font-['Inter:Medium',sans-serif] font-medium leading-[14px] left-[468px] not-italic text-[#5e6470] text-[10px] text-right top-[296px]">7.5%</p>
      <Group3 />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal h-[14px] leading-[14px] left-[40px] not-italic text-[#5e6470] text-[10px] top-[314px] w-[215px] whitespace-pre-wrap">{`Optimum-Payments Website Development (CMS + Custom Code [Modern Frameworks] + Maintenance + Backup + Support(LifeTime)) – Part-- Payment(50%) – 2 nd Installment `}</p>
      <div className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[14px] left-[40px] not-italic text-[#5e6470] text-[10px] top-[693px] w-[305px] whitespace-pre-wrap">
        <p className="mb-0">{`'Swade' is a trading name of ‘Swade Ltd' a branch of Big-bubble `}</p>
        <p className="mb-0">{`Head Office: Line 2 Modomo Ile-Ife `}</p>
        <p className="mb-0">{`Tel: +2348102604019 `}</p>
        <p>Registered Office: Head Office: Line 2 Modomo Ile-Ife, NG</p>
      </div>
      <p className="-translate-x-full absolute font-['Archivo:Medium',sans-serif] font-medium leading-[0] left-[555px] text-[#5e6470] text-[0px] text-right top-[85px] tracking-[0.24px]" style={{ fontVariationSettings: "\'wdth\' 100" }}>
        <span className="font-['Archivo:Bold',sans-serif] font-bold leading-[16px] text-[#b2b7c2] text-[12px]" style={{ fontVariationSettings: "\'wdth\' 100" }}>{`Order Ref  |  `}</span>
        <span className="leading-[16px] text-[10px]">#5FD2ECC89</span>
      </p>
    </div>
  );
}