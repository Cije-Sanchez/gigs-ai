// import Chat from "@/components/ChatUI";
// // import { columns } from "@/components/Columns";
// import { JobTable } from "@/components/JobTable";
// import { AISummaryCard } from "@/components/SummaryCard";
//
// import SidebarForm from "@/components/FilterSortForm";
// import { Error as ErrorState } from "@/components/LoadingAndErrorStates/Error";
// import { Loading } from "@/components/LoadingAndErrorStates/Loading";
// import Header from "@/components/ResultsHeader";
// import { SingleJobSlideOver } from "@/components/SingleJob";
// import { Button } from "@/components/ui/button";
//
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardDescription,
//   CardContent,
//   CardFooter,
// } from "@/components/ui/card";
//
// import { Input } from "@/components/ui/input";
// import { Separator } from "@/components/ui/separator";
// import { GlobalStateContext } from "@/Contexts";
// import { TColumns, TSources } from "@/GlobalState";
//
// import {
//   getJobsServer,
//   getPageServer,
//   getSummaryServer,
//   TSummaryContext,
// } from "@/lib/server";
// import { useContext, useEffect } from "react";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import { toast } from "sonner";
// import { Label } from "@/components/ui/label";
//
// export default function JobPage() {
//   const {
//     setJobsLoading,
//     setJobs,
//     setJobsError,
//     // jobs,
//     setSummaryLoading,
//     setSummaryError,
//     setSummary,
//     jobsLoading,
//     jobsError,
//     summaryEnabled,
//     setPagination,
//     setSearchId,
//     table,
//   } = useContext(GlobalStateContext)!;
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//   const searchTerm = searchParams.get("term");
//
//   function resetSummary(
//     setSummaryLoading: (loading: boolean) => void,
//     setSummaryError: (error: string | null) => void,
//   ) {
//     setSummaryLoading(false);
//     setSummaryError(null);
//   }
//
//   function resetJobs() {
//     setJobsLoading(false);
//     setJobsError(null);
//   }
//
//   async function handleSummary(summaryContext: TSummaryContext) {
//     return;
//     try {
//       if (!summaryEnabled) return;
//       resetSummary(setSummaryLoading, setSummaryError);
//       setSummaryLoading(true);
//       const { error, summary } = await getSummaryServer(summaryContext);
//       if (error) throw new Error(error);
//       if (!summary) throw new Error("Server Issue");
//       setSummaryLoading(false);
//       setSummary(summary);
//     } catch (error) {
//       setSummaryLoading(false);
//       const catchError = error as Error;
//       setSummaryError(catchError.message);
//       console.error(catchError.message);
//     }
//   }
//
//   useEffect(() => {
//     return;
//     const columns = searchParams.get("columns");
//     if (!columns) return;
//     if (!table) return;
//     const columnsParsed = JSON.parse(columns) as TColumns;
//     columnsParsed.forEach((column) => {
//       table.getColumn(column.id)?.toggleVisibility(column.isActive);
//     });
//   });
//
//   useEffect(() => {
//     return;
//     async function getPage() {
//       console.log("0");
//       const sourcesFromParams = searchParams.get("sources");
//       const daysOfDataFromParams = searchParams.get("sources");
//       const searchIdFromParams = searchParams.get("searchId");
//       const pageFromParams = searchParams.get("page");
//       const paginationFromParams = searchParams.get("pagination");
//       resetJobs();
//       try {
//         if (!sourcesFromParams) return;
//         if (!daysOfDataFromParams) return;
//         if (!searchIdFromParams) throw new Error("No searchId specified");
//         if (!pageFromParams) return toast.error("Invalid params");
//         if (!searchTerm) throw new Error("No searchTerm specified");
//         if (!paginationFromParams)
//           throw new Error("Pagination not specified in params");
//         const pageNumber = Number(pageFromParams);
//         const pagination = JSON.parse(paginationFromParams);
//
//         setJobsLoading(true);
//
//         const sources = JSON.parse(sourcesFromParams) as TSources;
//         const daysOfDataArray = JSON.parse(daysOfDataFromParams) as number[];
//         const daysOfDataFinal =
//           daysOfDataArray.length > 0 ? daysOfDataArray[0] : 3;
//         const sourcesFinal = sources
//           .filter((source) => source.isActive)
//           .map((source) => source.source);
//         console.log("Sources Final: ", sourcesFinal);
//
//         if (!pagination) throw new Error("Pagination not set");
//         const {
//           page,
//           error,
//           searchId,
//           totalResults,
//           pageSize,
//           jobs,
//           summaryContext,
//         } = await getPageServer(
//           searchIdFromParams,
//           pageNumber,
//           10,
//           pagination.totalResults,
//           searchTerm,
//           sourcesFinal,
//           daysOfDataFinal,
//         );
//         setJobsLoading(false);
//         if (error) throw new Error(error);
//         if (
//           !page ||
//           !searchId ||
//           !totalResults ||
//           !pageSize ||
//           !jobs ||
//           !summaryContext
//         )
//           throw new Error("Server Issue");
//         setJobs(jobs);
//         setPagination({
//           currentPage: page,
//           pageSize,
//           totalResults,
//         });
//         setSearchId(searchId);
//         handleSummary(summaryContext);
//       } catch (error) {
//         const catchError = error as Error;
//         toast.error(catchError.message);
//       }
//     }
//     getPage();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [searchParams]);
//
//   useEffect(() => {
//     return;
//     const page = searchParams.get("page");
//     const sources = searchParams.get("sources");
//     const daysOfData = searchParams.get("daysOfData");
//     if (page && Number(page) > 1) return;
//     if (sources || daysOfData) return;
//
//     resetJobs();
//     async function searchJobs() {
//       try {
//         setJobsLoading(true);
//         if (!searchTerm) {
//           toast.error("Invalid Search Term");
//           return navigate("/");
//         }
//         const {
//           error,
//           jobs,
//           page,
//           pageSize,
//           searchId,
//           totalResults,
//           summaryContext,
//         } = await getJobsServer(searchTerm);
//         if (error) {
//           throw new Error(error);
//         }
//         if (
//           !(
//             jobs &&
//             page &&
//             pageSize &&
//             searchId &&
//             totalResults &&
//             summaryContext
//           )
//         ) {
//           throw new Error("Server error");
//         }
//         setJobsLoading(false);
//         setJobs(jobs);
//         setPagination({
//           currentPage: page,
//           pageSize,
//           totalResults,
//         });
//         setSearchId(searchId);
//         handleSummary(summaryContext);
//       } catch (error) {
//         setJobsLoading(false);
//         const catchError = error as Error;
//         setJobsError(catchError.message);
//         console.error(catchError.message);
//       }
//     }
//     searchJobs();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [searchTerm]);
//
//   return (
//     <>
//       {/* <Header /> */}
//       <div className="hidden h-full flex-col md:flex">
//         <div defaultValue="complete" className="flex-1">
//           <div className="container  py-6 h-dvh">
//             <div className="flex h-full items-stretch gap-6 flex-row">
//               <div className="my-8 ">
//                 <Card className="h-full">
//                   <CardContent className="space-y-2 my-8">
//                     <SidebarForm />
//                   </CardContent>
//                 </Card>
//               </div>
//               <div className="flex-grow">
//                 <div className="mt-0 border-0 p-0 h-full">
//                   <div className="flex h-full flex-col space-y-4">
//                     {jobsLoading ? (
//                       <Loading />
//                     ) : jobsError ? (
//                       <ErrorState error={jobsError} />
//                     ) : (
//                       <>
//                         {summaryEnabled && <AISummaryCard />}
//                         {/* <JobTable */}
//                         {/*   className="min-h-[200px] flex-1 p-4 md:min-h-[200px] lg:min-h-[200px] flex-grow" */}
//                         {/*   columns={columns} */}
//                         {/*   data={jobs} */}
//                         {/* /> */}
//                         <Chat />
//                       </>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//       <SingleJobSlideOver />
//     </>
//   );
// }
