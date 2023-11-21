FROM --platform=linux/x86_64 node:20-slim
WORKDIR /backend
COPY . .
EXPOSE 3001
RUN yarn
ENTRYPOINT [ "yarn" ]
CMD [ "start" ]