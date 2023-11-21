FROM --platform=linux/x86_64 node:20-slim
WORKDIR /backend
COPY . .
EXPOSE 3000
RUN yarn
ENTRYPOINT [ "yarn" ]
CMD [ "start" ]