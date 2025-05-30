import { Fragment } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getTaskById, updateTaskStatus } from "@/api/TaskAPI";
import { toast } from "react-toastify";
import { formatDate } from "@/utils/utils";
import { statusTranslations } from "@/locales/en";
import { TaskStatus } from "@/types/index";
import NotesPanel from "../notes/NotesPanel";

export default function TaskModalDetails() {
  const params = useParams();
  const projectId = params.projectId!;
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const taskId = queryParams.get("viewTask")!;

  const show = taskId ? true : false;

  const { data, isError, error } = useQuery({
    queryKey: ["task", taskId],
    queryFn: () => getTaskById({ projectId, taskId }),
    enabled: !!taskId,
    retry: false,
  });

  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: updateTaskStatus,
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      toast.success(data);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value as TaskStatus;
    const data = {
      projectId,
      taskId,
      status,
    };

    mutate(data);
  };

  if (isError) {
    setTimeout(() => {
      toast.error(error.message, { toastId: "error" });
    }, 1);
    return <Navigate to={`/projects/${projectId}`} />;
  }
  if (data)
    return (
      <>
        <Transition appear show={show} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-10"
            onClose={() => navigate(location.pathname, { replace: true })}
          >
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/60" />
            </TransitionChild>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <TransitionChild
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <DialogPanel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all p-16">
                    <p className="text-sm text-slate-400">
                      Created at: {formatDate(data.createdAt)}
                    </p>
                    <p className="text-sm text-slate-400">
                      Last Update: {formatDate(data.updatedAt)}{" "}
                    </p>
                    <DialogTitle
                      as="h3"
                      className="font-black text-4xl text-slate-600 my-5"
                    >
                      {data.name}
                    </DialogTitle>
                    <p className="text-lg text-slate-500 mb-2">
                      Description: {data.description}
                    </p>

                    {data.completedBy.length ? (
                      <>
                        <p className="font-bold text-2xl text-slate-600 my-5">
                          Change History
                        </p>
                        <ul className="list-decimal">
                          {data.completedBy.map((activityLog) => (
                            <li key={activityLog._id}>
                              <span className="font-bold text-slate-600">
                                {statusTranslations[activityLog.status]}
                              </span>{" "}
                              by: {activityLog.user.name}
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : null}
                    <div className="my-5 space-y-3">
                      <label className="font-bold">Status:</label>

                      <select
                        className="w-full bg-white border border-gray-300"
                        name=""
                        id=""
                        defaultValue={data.status}
                        onChange={handleChange}
                      >
                        {Object.entries(statusTranslations).map(
                          ([key, value]) => (
                            <option key={key} value={key}>
                              {value}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                    <NotesPanel notes={data.notes} />
                  </DialogPanel>
                </TransitionChild>
              </div>
            </div>
          </Dialog>
        </Transition>
      </>
    );
}
